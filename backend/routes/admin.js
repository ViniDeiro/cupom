const express = require('express');
const { body, validationResult } = require('express-validator');
const { SpecialDay, User, Coupon, Product, Order, Admin } = require('../models');
const { authAdmin, requireSuperAdmin } = require('../middleware/auth');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const router = express.Router();

console.log('🔧 Carregando rotas administrativas...');

// === GESTÃO DE ADMINISTRADORES ===

// Listar administradores (apenas super admin pode ver)
router.get('/administradores', authAdmin, requireSuperAdmin, async (req, res) => {
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

    const { count, rows: administradores } = await Admin.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'nome', 'email', 'nivel', 'createdAt', 'updatedAt']
    });

    res.json({
      administradores,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar administradores:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Criar novo administrador (apenas super admin pode criar)
router.post('/administradores', authAdmin, requireSuperAdmin, [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('nivel').isIn(['admin', 'super']).withMessage('Nível deve ser admin ou super')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { nome, email, senha, nivel } = req.body;

    // Verificar se já existe um admin com este email
    const adminExistente = await Admin.findOne({ where: { email } });
    if (adminExistente) {
      return res.status(400).json({
        erro: 'Já existe um administrador com este email'
      });
    }

    // Criar novo administrador
    const novoAdmin = await Admin.create({
      nome,
      email,
      senha, // O hook beforeCreate no modelo Admin vai criptografar a senha
      nivel
    });

    // Remover a senha do objeto de resposta
    const adminResponse = novoAdmin.toJSON();

    res.status(201).json({
      mensagem: 'Administrador criado com sucesso',
      admin: adminResponse
    });

  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Promover usuário para administrador (apenas super admin pode promover)
router.post('/promover-usuario/:id', authAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verificar se o usuário existe
    const usuario = await User.findByPk(userId);
    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado'
      });
    }

    // Verificar se já existe um admin com este email
    const adminExistente = await Admin.findOne({ where: { email: usuario.email } });
    if (adminExistente) {
      return res.status(400).json({
        erro: 'Este usuário já é um administrador'
      });
    }

    // Criar um novo administrador com os dados do usuário
    // Gerar uma senha temporária aleatória
    const senhaTemporaria = Math.random().toString(36).slice(-8);
    const senhaHash = await bcrypt.hash(senhaTemporaria, 12);

    const novoAdmin = await Admin.create({
      nome: usuario.nome,
      email: usuario.email,
      senha: senhaHash,
      nivel: 'admin' // Promovido como admin normal, não super
    });

    // Enviar email com a senha temporária (em um ambiente real)
    // await emailService.enviarEmail({
    //   para: usuario.email,
    //   assunto: 'Você foi promovido a administrador',
    //   texto: `Você foi promovido a administrador. Sua senha temporária é: ${senhaTemporaria}. Por favor, altere-a após o primeiro login.`
    // });

    res.json({
      mensagem: 'Usuário promovido a administrador com sucesso',
      admin: {
        id: novoAdmin.id,
        nome: novoAdmin.nome,
        email: novoAdmin.email,
        nivel: novoAdmin.nivel
      },
      senha_temporaria: senhaTemporaria // Em produção, isso seria enviado apenas por email
    });

  } catch (error) {
    console.error('Erro ao promover usuário:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Alterar nível de administrador (apenas super admin pode alterar)
router.put('/administradores/:id/nivel', authAdmin, requireSuperAdmin, [
  body('nivel').isIn(['admin', 'super']).withMessage('Nível deve ser admin ou super')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const adminId = req.params.id;
    const { nivel } = req.body;

    // Verificar se o admin existe
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({
        erro: 'Administrador não encontrado'
      });
    }

    // Impedir que um super admin rebaixe a si mesmo
    if (admin.id === req.admin.id && nivel === 'admin') {
      return res.status(400).json({
        erro: 'Você não pode rebaixar seu próprio nível'
      });
    }

    // Atualizar o nível
    await admin.update({ nivel });

    res.json({
      mensagem: `Administrador ${nivel === 'super' ? 'promovido a super administrador' : 'rebaixado para administrador normal'} com sucesso`,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        nivel: admin.nivel
      }
    });

  } catch (error) {
    console.error('Erro ao alterar nível de administrador:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Remover privilégios de administrador (apenas super admin pode remover)
router.delete('/administradores/:id', authAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const adminId = req.params.id;

    // Verificar se o admin existe
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({
        erro: 'Administrador não encontrado'
      });
    }

    // Impedir que um super admin remova a si mesmo
    if (admin.id === req.admin.id) {
      return res.status(400).json({
        erro: 'Você não pode remover seus próprios privilégios'
      });
    }

    // Desativar o admin (soft delete)
    await admin.update({ ativo: false });

    res.json({
      mensagem: 'Privilégios de administrador removidos com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover administrador:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Criar super administrador (rota pública, mas só funciona se não existir nenhum super admin)
router.post('/criar-super-admin', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    // Verificar se já existe algum super admin
    const superAdminExistente = await Admin.findOne({ where: { nivel: 'super', ativo: true } });
    if (superAdminExistente) {
      return res.status(400).json({
        erro: 'Já existe um super administrador no sistema'
      });
    }

    const { nome, email, senha } = req.body;

    // Verificar se já existe um admin com este email
    const adminExistente = await Admin.findOne({ where: { email } });
    if (adminExistente) {
      return res.status(400).json({
        erro: 'Já existe um administrador com este email'
      });
    }

    // Criar super admin
    const superAdmin = await Admin.create({
      nome,
      email,
      senha, // O hook beforeCreate no modelo Admin vai criptografar a senha
      nivel: 'super'
    });

    // Remover a senha do objeto de resposta
    const adminResponse = superAdmin.toJSON();

    res.status(201).json({
      mensagem: 'Super administrador criado com sucesso',
      admin: adminResponse
    });

  } catch (error) {
    console.error('Erro ao criar super administrador:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

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
    const { CouponType } = require('../models');
    
    let tiposCupons = await CouponType.findAll({
      order: [['desconto', 'ASC']]
    });
    
    // Se não existirem tipos de cupons, criar os padrões
    if (tiposCupons.length === 0) {
      const tiposPadrao = [
        {
          nome: 'Cupom Bronze',
          desconto: 10,
          preco: 25.00,
          descricao: 'Desconto de 10% em produtos selecionados',
          validade_dias: 90,
          ativo: true
        },
        {
          nome: 'Cupom Prata',
          desconto: 20,
          preco: 45.00,
          descricao: 'Desconto de 20% em produtos selecionados',
          validade_dias: 90,
          ativo: true
        },
        {
          nome: 'Cupom Ouro',
          desconto: 30,
          preco: 65.00,
          descricao: 'Desconto de 30% em produtos selecionados',
          validade_dias: 90,
          ativo: true
        },
        {
          nome: 'Cupom Diamante',
          desconto: 50,
          preco: 100.00,
          descricao: 'Desconto de 50% em produtos selecionados',
          validade_dias: 90,
          ativo: true
        }
      ];
      
      await CouponType.bulkCreate(tiposPadrao);
      
      // Buscar novamente após criar
      tiposCupons = await CouponType.findAll({
        order: [['desconto', 'ASC']]
      });
    }

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

    const { CouponType } = require('../models');
    
    const novoTipo = await CouponType.create({
      ...req.body,
      ativo: true
    });

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
    const { CouponType } = require('../models');

    // Verificar se o tipo de cupom existe
    const tipoCupom = await CouponType.findByPk(id);
    if (!tipoCupom) {
      return res.status(404).json({
        erro: 'Tipo de cupom não encontrado'
      });
    }

    // Atualizar o tipo de cupom
    await tipoCupom.update(req.body);

    res.json({
      mensagem: 'Tipo de cupom atualizado com sucesso!',
      tipo: tipoCupom
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
    const { CouponType } = require('../models');

    // Verificar se o tipo de cupom existe
    const tipoCupom = await CouponType.findByPk(id);
    if (!tipoCupom) {
      return res.status(404).json({
        erro: 'Tipo de cupom não encontrado'
      });
    }

    // Verificar se há cupons associados a este tipo
    const { Coupon } = require('../models');
    const cuponsAssociados = await Coupon.count({ where: { tipo_id: id } });
    
    if (cuponsAssociados > 0) {
      return res.status(400).json({
        erro: 'Não é possível excluir este tipo de cupom pois existem cupons associados a ele',
        cupons: cuponsAssociados
      });
    }

    // Excluir o tipo de cupom
    await tipoCupom.destroy();

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
