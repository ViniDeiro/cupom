const express = require('express');
const { body, validationResult } = require('express-validator');
const { SpecialDay, User, Coupon, Product, Order } = require('../models');
const { authAdmin } = require('../middleware/auth');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

const router = express.Router();

console.log('🔧 Carregando rotas administrativas...');

// === GESTÃO DE DIAS ESPECIAIS ===

// Listar dias especiais
router.get('/dias-especiais', authAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: diasEspeciais } = await SpecialDay.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data_inicio', 'DESC']]
    });

    res.json({
      dias_especiais: diasEspeciais,
      total: count,
      page: parseInt(page),
      total_pages: Math.ceil(count / limit)
    });

  } catch (error) {
    console.error('Erro ao listar dias especiais:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Listar usuários com paginação
router.get('/usuarios', authAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      ativo: true
    };

    if (search) {
      whereClause[Op.or] = [
        { nome: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: usuarios } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'nome', 'email', 'telefone', 'createdAt', 'updatedAt']
    });

    res.json({
      usuarios,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Estatísticas de pedidos
router.get('/estatisticas/pedidos', authAdmin, async (req, res) => {
  try {
    const { periodo = '30' } = req.query;
    const agora = new Date();
    const dataInicio = new Date(agora.getTime() - (parseInt(periodo) * 24 * 60 * 60 * 1000));

    const [totalPedidos, receitaTotal, pedidosPorStatus] = await Promise.all([
      Order.count({
        where: {
          createdAt: { [Op.gte]: dataInicio }
        }
      }),
      Order.sum('total_final', {
        where: {
          createdAt: { [Op.gte]: dataInicio }
        }
      }) || 0,
      Order.findAll({
        where: {
          createdAt: { [Op.gte]: dataInicio }
        },
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      })
    ]);

    const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0;

    res.json({
      periodo_dias: parseInt(periodo),
      total_pedidos: totalPedidos,
      receita_total: receitaTotal,
      ticket_medio: ticketMedio,
      pedidos_por_status: pedidosPorStatus.map(item => ({
        status: item.status,
        quantidade: parseInt(item.count)
      }))
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de pedidos:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Estatísticas de cupons
router.get('/estatisticas/cupons', authAdmin, async (req, res) => {
  try {
    const agora = new Date();
    
    const [totalCupons, cuponsUsados, cuponsAtivos, cuponsExpirados] = await Promise.all([
      Coupon.count(),
      Coupon.count({ where: { usado: true } }),
      Coupon.count({
        where: {
          usado: false,
          data_validade: { [Op.gt]: agora }
        }
      }),
      Coupon.count({
        where: {
          usado: false,
          data_validade: { [Op.lte]: agora }
        }
      })
    ]);

    const taxaUso = totalCupons > 0 ? (cuponsUsados / totalCupons * 100) : 0;

    res.json({
      total_cupons: totalCupons,
      cupons_usados: cuponsUsados,
      cupons_ativos: cuponsAtivos,
      cupons_expirados: cuponsExpirados,
      taxa_uso: parseFloat(taxaUso.toFixed(2))
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de cupons:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Criar dia especial
router.post('/dias-especiais', authAdmin, [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao').optional().trim(),
  body('data_inicio').isISO8601().withMessage('Data de início inválida'),
  body('data_fim').isISO8601().withMessage('Data de fim inválida'),
  body('desconto_geral').optional().isInt({ min: 0, max: 100 }).withMessage('Desconto deve ser entre 0 e 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { nome, descricao, data_inicio, data_fim, desconto_geral } = req.body;

    // Validar datas
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    const agora = new Date();

    if (inicio >= fim) {
      return res.status(400).json({
        erro: 'Data de início deve ser anterior à data de fim'
      });
    }

    if (fim <= agora) {
      return res.status(400).json({
        erro: 'Data de fim deve ser futura'
      });
    }

    // Verificar conflitos de datas
    const conflito = await SpecialDay.findOne({
      where: {
        ativo: true,
        [Op.or]: [
          {
            data_inicio: {
              [Op.between]: [inicio, fim]
            }
          },
          {
            data_fim: {
              [Op.between]: [inicio, fim]
            }
          },
          {
            [Op.and]: [
              { data_inicio: { [Op.lte]: inicio } },
              { data_fim: { [Op.gte]: fim } }
            ]
          }
        ]
      }
    });

    if (conflito) {
      return res.status(400).json({
        erro: 'Já existe um dia especial ativo neste período'
      });
    }

    const diaEspecial = await SpecialDay.create({
      nome,
      descricao,
      data_inicio: inicio,
      data_fim: fim,
      desconto_geral,
      criado_por: req.admin.id
    });

    res.status(201).json({
      mensagem: 'Dia especial criado com sucesso',
      dia_especial: diaEspecial
    });

  } catch (error) {
    console.error('Erro ao criar dia especial:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Ativar dia especial e notificar usuários
router.post('/dias-especiais/:id/ativar', authAdmin, async (req, res) => {
  try {
    const diaEspecial = await SpecialDay.findByPk(req.params.id);
    
    if (!diaEspecial) {
      return res.status(404).json({
        erro: 'Dia especial não encontrado'
      });
    }

    // Verificar se está no período correto
    const agora = new Date();
    if (agora < diaEspecial.data_inicio || agora > diaEspecial.data_fim) {
      return res.status(400).json({
        erro: 'Só é possível ativar dentro do período do evento'
      });
    }

    await diaEspecial.update({ ativo: true });

    // Notificar usuários com cupons válidos
    const usuariosComCupons = await User.findAll({
      include: [{
        model: Coupon,
        as: 'cupons',
        where: {
          usado: false,
          ativo: true,
          data_validade: { [Op.gte]: agora }
        }
      }]
    });

    let emailsEnviados = 0;
    for (const usuario of usuariosComCupons) {
      const resultado = await emailService.notificarDiaEspecial(usuario, diaEspecial);
      if (resultado.sucesso) {
        emailsEnviados++;
      }
    }

    res.json({
      mensagem: 'Dia especial ativado com sucesso',
      usuarios_notificados: emailsEnviados,
      dia_especial: diaEspecial
    });

  } catch (error) {
    console.error('Erro ao ativar dia especial:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Atualizar dia especial
router.put('/dias-especiais/:id', authAdmin, [
  body('nome').optional().trim().isLength({ min: 2, max: 100 }),
  body('descricao').optional().trim(),
  body('data_inicio').optional().isISO8601(),
  body('data_fim').optional().isISO8601(),
  body('desconto_geral').optional().isInt({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const diaEspecial = await SpecialDay.findByPk(req.params.id);
    
    if (!diaEspecial) {
      return res.status(404).json({
        erro: 'Dia especial não encontrado'
      });
    }

    await diaEspecial.update(req.body);

    res.json({
      mensagem: 'Dia especial atualizado com sucesso',
      dia_especial: diaEspecial
    });

  } catch (error) {
    console.error('Erro ao atualizar dia especial:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Desativar dia especial
router.delete('/dias-especiais/:id', authAdmin, async (req, res) => {
  try {
    const diaEspecial = await SpecialDay.findByPk(req.params.id);
    
    if (!diaEspecial) {
      return res.status(404).json({
        erro: 'Dia especial não encontrado'
      });
    }

    await diaEspecial.update({ ativo: false });

    res.json({
      mensagem: 'Dia especial desativado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desativar dia especial:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// === DASHBOARD E ESTATÍSTICAS ===

// Dashboard principal
router.get('/dashboard', authAdmin, async (req, res) => {
  try {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    // Estatísticas gerais
    const [
      totalUsuarios,
      totalProdutos,
      totalPedidos,
      totalCupons,
      pedidosHoje,
      cuponsVendidosHoje,
      receitaTotal,
      receitaMes
    ] = await Promise.all([
      User.count({ where: { ativo: true } }),
      Product.count({ where: { ativo: true } }),
      Order.count(),
      Coupon.count(),
      Order.count({ 
        where: { 
          createdAt: { [Op.gte]: new Date(agora.toDateString()) } 
        } 
      }),
      Coupon.count({ 
        where: { 
          data_compra: { [Op.gte]: new Date(agora.toDateString()) } 
        } 
      }),
      Order.sum('total_final') || 0,
      Order.sum('total_final', { 
        where: { 
          createdAt: { [Op.gte]: inicioMes } 
        } 
      }) || 0
    ]);

    // Pedidos recentes (últimos 5)
    const pedidosRecentes = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'usuario',
        attributes: ['nome', 'email']
      }],
      attributes: ['id', 'total_final', 'status', 'createdAt']
    });

    // Usuários recentes (últimos 5)
    const usuariosRecentes = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      where: { ativo: true },
      attributes: ['id', 'nome', 'email', 'createdAt']
    });

    // Cupons ativos
    const cuponsAtivos = await Coupon.count({
      where: {
        usado: false,
        data_validade: { [Op.gt]: agora }
      }
    });

    // Verificar dia especial ativo
    const diaEspecialAtivo = await SpecialDay.findOne({
      where: {
        ativo: true,
        data_inicio: { [Op.lte]: agora },
        data_fim: { [Op.gte]: agora }
      }
    });

    res.json({
      estatisticas: {
        totalUsers: totalUsuarios,
        totalOrders: totalPedidos,
        totalRevenue: receitaTotal,
        activeCoupons: cuponsAtivos,
        pedidos_hoje: pedidosHoje,
        cupons_vendidos_hoje: cuponsVendidosHoje,
        receita_mes: receitaMes
      },
      recentOrders: pedidosRecentes.map(pedido => ({
        id: pedido.id,
        customer: pedido.usuario ? pedido.usuario.nome : 'Usuário não encontrado',
        total: parseFloat(pedido.total_final),
        status: pedido.status,
        createdAt: pedido.createdAt
      })),
      recentUsers: usuariosRecentes,
      dia_especial_ativo: diaEspecialAtivo
    });

  } catch (error) {
    console.error('Erro ao obter dashboard:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// === GESTÃO DE TIPOS DE CUPONS ===

// Listar tipos de cupons
router.get('/tipos-cupons', authAdmin, async (req, res) => {
  try {
    const tiposCupons = [
      {
        id: 1,
        nome: 'Cupom Bronze',
        desconto: 10,
        preco: 25.00,
        descricao: 'Desconto de 10% em produtos selecionados',
        validade_dias: 90,
        ativo: true
      },
      {
        id: 2,
        nome: 'Cupom Prata',
        desconto: 20,
        preco: 45.00,
        descricao: 'Desconto de 20% em produtos selecionados',
        validade_dias: 90,
        ativo: true
      },
      {
        id: 3,
        nome: 'Cupom Ouro',
        desconto: 30,
        preco: 65.00,
        descricao: 'Desconto de 30% em produtos selecionados',
        validade_dias: 90,
        ativo: true
      },
      {
        id: 4,
        nome: 'Cupom Diamante',
        desconto: 50,
        preco: 100.00,
        descricao: 'Desconto de 50% em produtos selecionados',
        validade_dias: 90,
        ativo: true
      }
    ];

    res.json(tiposCupons);
  } catch (error) {
    console.error('Erro ao listar tipos de cupons:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Criar tipo de cupom
router.post('/tipos-cupons', authAdmin, [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao').optional().trim(),
  body('desconto').isInt({ min: 1, max: 100 }).withMessage('Desconto deve ser entre 1 e 100'),
  body('preco').isFloat({ min: 0.01 }).withMessage('Preço deve ser maior que 0'),
  body('validade_dias').isInt({ min: 1 }).withMessage('Validade deve ser maior que 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    // Por enquanto, retornamos sucesso simulado
    // Em uma implementação real, salvaria no banco de dados
    const novoTipo = {
      id: Date.now(), // ID temporário
      ...req.body,
      ativo: true
    };

    res.status(201).json({
      mensagem: 'Tipo de cupom criado com sucesso!',
      tipo: novoTipo
    });

  } catch (error) {
    console.error('Erro ao criar tipo de cupom:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Atualizar tipo de cupom
router.put('/tipos-cupons/:id', authAdmin, [
  body('nome').optional().trim().isLength({ min: 2, max: 100 }),
  body('descricao').optional().trim(),
  body('desconto').optional().isInt({ min: 1, max: 100 }),
  body('preco').optional().isFloat({ min: 0.01 }),
  body('validade_dias').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { id } = req.params;
    
    // Por enquanto, retornamos sucesso simulado
    // Em uma implementação real, atualizaria no banco de dados
    res.json({
      mensagem: 'Tipo de cupom atualizado com sucesso!',
      tipo: {
        id: parseInt(id),
        ...req.body
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar tipo de cupom:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Deletar tipo de cupom
router.delete('/tipos-cupons/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Por enquanto, retornamos sucesso simulado
    // Em uma implementação real, deletaria do banco de dados
    res.json({
      mensagem: 'Tipo de cupom deletado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao deletar tipo de cupom:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Relatório de vendas de cupons
router.get('/relatorio/cupons', authAdmin, async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    
    const whereClause = {};
    if (data_inicio && data_fim) {
      whereClause.data_compra = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      };
    }

    const cupons = await Coupon.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'usuario',
        attributes: ['nome', 'email']
      }],
      order: [['data_compra', 'DESC']]
    });

    const resumo = {
      total_cupons: cupons.length,
      receita_cupons: cupons.reduce((sum, cupom) => sum + parseFloat(cupom.valor_pago), 0),
      cupons_usados: cupons.filter(c => c.usado).length,
      cupons_validos: cupons.filter(c => c.isValido()).length
    };

    res.json({
      resumo,
      cupons
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de cupons:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
