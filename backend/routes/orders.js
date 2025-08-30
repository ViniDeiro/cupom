const express = require('express');
const { body, validationResult } = require('express-validator');
const { Order, OrderItem, Product, Coupon, User, SpecialDay } = require('../models');
const { authUser, authAdmin } = require('../middleware/auth');
const { sequelize } = require('../config/database');

const router = express.Router();

// Criar pedido
router.post('/', authUser, [
  body('itens').isArray({ min: 1 }).withMessage('Pedido deve ter pelo menos um item'),
  body('itens.*.produto_id').isUUID().withMessage('ID do produto inválido'),
  body('itens.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  body('cupom_codigo').optional().isString(),
  body('forma_pagamento').optional().isIn(['pix', 'cartao', 'boleto']).withMessage('Forma de pagamento inválida'),
  body('endereco_entrega').isObject().withMessage('Endereço de entrega é obrigatório'),
  body('endereco_entrega.cep').matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido'),
  body('endereco_entrega.rua').notEmpty().withMessage('Rua é obrigatória'),
  body('endereco_entrega.numero').notEmpty().withMessage('Número é obrigatório'),
  body('endereco_entrega.cidade').notEmpty().withMessage('Cidade é obrigatória'),
  body('endereco_entrega.estado').notEmpty().withMessage('Estado é obrigatório')
], async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { itens, cupom_codigo, forma_pagamento, endereco_entrega, observacoes } = req.body;
    const usuario = req.user;

    // Verificar se é dia especial para produtos especiais
    const diaEspecial = await SpecialDay.isHojeDiaEspecial();

    // Validar produtos e calcular total
    let totalProdutos = 0;
    const itensValidados = [];

    for (const item of itens) {
      const produto = await Product.findByPk(item.produto_id);
      
      if (!produto || !produto.ativo) {
        await transaction.rollback();
        return res.status(400).json({
          erro: `Produto ${item.produto_id} não encontrado ou inativo`
        });
      }

      // Verificar se produto está disponível
      if (produto.disponivel_dias_especiais && !diaEspecial) {
        await transaction.rollback();
        return res.status(400).json({
          erro: `Produto ${produto.nome} está disponível apenas em dias especiais`
        });
      }

      // Verificar estoque
      if (produto.estoque < item.quantidade) {
        await transaction.rollback();
        return res.status(400).json({
          erro: `Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoque}`
        });
      }

      // Calcular preço (usar preço especial se for dia especial)
      let precoUnitario = produto.preco;
      if (diaEspecial && produto.preco_desconto) {
        precoUnitario = produto.preco_desconto;
      }

      const subtotal = precoUnitario * item.quantidade;
      totalProdutos += subtotal;

      itensValidados.push({
        produto_id: produto.id,
        quantidade: item.quantidade,
        preco_unitario: precoUnitario,
        subtotal
      });
    }

    // Validar e aplicar cupom se fornecido
    let cupom = null;
    let descontoCupom = 0;

    if (cupom_codigo) {
      // Verificar se é dia especial (cupons só funcionam em dias especiais)
      if (!diaEspecial) {
        await transaction.rollback();
        return res.status(400).json({
          erro: 'Cupons só podem ser usados em dias especiais'
        });
      }

      cupom = await Coupon.findOne({
        where: { 
          codigo: cupom_codigo,
          usuario_id: usuario.id 
        }
      });

      if (!cupom) {
        await transaction.rollback();
        return res.status(400).json({
          erro: 'Cupom não encontrado'
        });
      }

      if (!cupom.isValido()) {
        await transaction.rollback();
        let motivo = 'Cupom inválido';
        if (cupom.usado) motivo = 'Cupom já foi utilizado';
        else if (!cupom.ativo) motivo = 'Cupom inativo';
        else if (new Date() > cupom.data_validade) motivo = 'Cupom expirado';

        return res.status(400).json({
          erro: motivo
        });
      }

      // Calcular desconto do cupom
      descontoCupom = totalProdutos * (cupom.desconto_percentual / 100);
    }

    // Calcular total final
    const totalFinal = totalProdutos - descontoCupom;

    // Gerar número do pedido
    const numeroPedido = Order.gerarNumero();

    // Criar pedido
    const pedido = await Order.create({
      numero: numeroPedido,
      usuario_id: usuario.id,
      cupom_id: cupom ? cupom.id : null,
      total_produtos: totalProdutos,
      desconto_cupom: descontoCupom,
      total_final: totalFinal,
      forma_pagamento,
      endereco_entrega,
      observacoes
    }, { transaction });

    // Criar itens do pedido
    for (const item of itensValidados) {
      await OrderItem.create({
        pedido_id: pedido.id,
        ...item
      }, { transaction });

      // Atualizar estoque
      await Product.decrement('estoque', {
        by: item.quantidade,
        where: { id: item.produto_id },
        transaction
      });
    }

    // Marcar cupom como usado
    if (cupom) {
      await cupom.update({
        usado: true,
        data_uso: new Date(),
        pedido_id: pedido.id
      }, { transaction });
    }

    await transaction.commit();

    // Buscar pedido completo para retorno
    const pedidoCompleto = await Order.findByPk(pedido.id, {
      include: [
        {
          model: OrderItem,
          as: 'itens',
          include: [{
            model: Product,
            as: 'produto'
          }]
        },
        {
          model: Coupon,
          as: 'cupom'
        }
      ]
    });

    res.status(201).json({
      mensagem: 'Pedido criado com sucesso!',
      pedido: pedidoCompleto
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Listar pedidos do usuário
router.get('/meus-pedidos', authUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: pedidos } = await Order.findAndCountAll({
      where: { usuario_id: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'itens',
          include: [{
            model: Product,
            as: 'produto'
          }]
        },
        {
          model: Coupon,
          as: 'cupom'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      pedidos,
      paginacao: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Rota alternativa para buscar pedidos do usuário
router.get('/user', authUser, async (req, res) => {
  try {
    const pedidos = await Order.findAll({
      where: { usuario_id: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'itens',
          include: [{
            model: Product,
            as: 'produto'
          }]
        },
        {
          model: Coupon,
          as: 'cupom'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(pedidos);

  } catch (error) {
    console.error('Erro ao listar pedidos do usuário:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Obter pedido específico
router.get('/:id', authUser, async (req, res) => {
  try {
    const pedido = await Order.findOne({
      where: { 
        id: req.params.id,
        usuario_id: req.user.id 
      },
      include: [
        {
          model: OrderItem,
          as: 'itens',
          include: [{
            model: Product,
            as: 'produto'
          }]
        },
        {
          model: Coupon,
          as: 'cupom'
        }
      ]
    });

    if (!pedido) {
      return res.status(404).json({
        erro: 'Pedido não encontrado'
      });
    }

    res.json({
      pedido
    });

  } catch (error) {
    console.error('Erro ao obter pedido:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// === ROTAS ADMINISTRATIVAS ===

// Listar todos os pedidos (admin)
router.get('/admin/todos', authAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: pedidos } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nome', 'email']
        },
        {
          model: OrderItem,
          as: 'itens',
          include: [{
            model: Product,
            as: 'produto'
          }]
        },
        {
          model: Coupon,
          as: 'cupom'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      pedidos,
      paginacao: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar pedidos admin:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Atualizar status do pedido (admin)
router.patch('/:id/status', authAdmin, [
  body('status').isIn(['pendente', 'confirmado', 'preparando', 'enviado', 'entregue', 'cancelado']).withMessage('Status inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { status } = req.body;
    const pedido = await Order.findByPk(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        erro: 'Pedido não encontrado'
      });
    }

    await pedido.update({ status });

    res.json({
      mensagem: 'Status do pedido atualizado com sucesso',
      pedido
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
