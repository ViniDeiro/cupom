const express = require('express');
const { body, validationResult } = require('express-validator');
const { Order, OrderItem, Product, User } = require('../models');
const { authUser } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const { sequelize } = require('../config/database');
const rateLimit = require('express-rate-limit');

// Função para validar CPF
const isValidCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10]);
};

// Rate limiting para pagamentos
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de pagamento por IP
  message: {
    erro: 'Muitas tentativas de pagamento. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para webhooks
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo 100 webhooks por minuto
  message: {
    erro: 'Muitas requisições de webhook'
  }
});

const router = express.Router();

// Criar preferência de pagamento (checkout)
router.post('/create-preference', authUser, [
  body('pedido_id').isUUID().withMessage('ID do pedido inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { pedido_id } = req.body;
    const usuario = req.user;

    // Buscar pedido com itens
    const pedido = await Order.findOne({
      where: { 
        id: pedido_id, 
        usuario_id: usuario.id,
        status: 'pendente'
      },
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    if (!pedido) {
      return res.status(404).json({
        erro: 'Pedido não encontrado ou já processado'
      });
    }

    // Preparar dados para o Mercado Pago
    const dadosPedido = {
      itens: pedido.OrderItems.map(item => ({
        produto_id: item.produto_id,
        nome: item.Product.nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario
      })),
      total: pedido.total_final,
      usuario: {
        nome: usuario.nome,
        email: usuario.email
      },
      pedidoId: pedido.id
    };

    // Criar preferência no Mercado Pago
    const preferencia = await paymentService.criarPreferencia(dadosPedido);

    // Salvar ID da preferência no pedido
    await pedido.update({
      mercado_pago_preference_id: preferencia.id
    });

    res.json({
      preference_id: preferencia.id,
      init_point: preferencia.init_point,
      sandbox_init_point: preferencia.sandbox_init_point
    });

  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Processar pagamento direto (cartão)
router.post('/process-payment', paymentLimiter, authUser, [
  body('token').notEmpty().withMessage('Token do cartão é obrigatório'),
  body('payment_method_id').notEmpty().withMessage('Método de pagamento é obrigatório'),
  body('pedido_id').isUUID().withMessage('ID do pedido inválido'),
  body('payer.email').isEmail().withMessage('Email inválido'),
  body('payer.identification.number').matches(/^\d{11}$/).withMessage('CPF deve ter 11 dígitos'),
  body('payer.identification.type').equals('CPF').withMessage('Tipo de identificação deve ser CPF'),
  body('transaction_amount').isFloat({ min: 0.01 }).withMessage('Valor da transação inválido'),
  body('installments').isInt({ min: 1, max: 12 }).withMessage('Número de parcelas inválido')
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

    const { token, payment_method_id, pedido_id, payer, transaction_amount, installments } = req.body;
    const usuario = req.user;

    // Validações de segurança adicionais
    if (!isValidCPF(payer.identification.number)) {
      return res.status(400).json({
        erro: 'CPF inválido'
      });
    }

    // Verificar se o valor não foi alterado maliciosamente
    if (transaction_amount > 10000) { // Limite máximo de R$ 10.000
      return res.status(400).json({
        erro: 'Valor da transação excede o limite permitido'
      });
    }

    // Buscar pedido
    const pedido = await Order.findOne({
      where: { 
        id: pedido_id, 
        usuario_id: usuario.id,
        status: 'pendente'
      },
      transaction
    });

    if (!pedido) {
      await transaction.rollback();
      return res.status(404).json({
        erro: 'Pedido não encontrado ou já processado'
      });
    }

    // Preparar dados do pagamento
    const dadosPagamento = {
      token,
      transaction_amount: pedido.total_final,
      description: `Pedido #${pedido.id} - Eu Tenho Sonhos`,
      payment_method_id,
      payer,
      external_reference: pedido.id.toString()
    };

    // Processar pagamento
    const resultado = await paymentService.processarPagamento(dadosPagamento);

    // Atualizar pedido com informações do pagamento
    await pedido.update({
      mercado_pago_payment_id: resultado.id,
      status: resultado.status === 'approved' ? 'confirmado' : 'pendente',
      forma_pagamento: payment_method_id
    }, { transaction });

    await transaction.commit();

    res.json({
      payment_id: resultado.id,
      status: resultado.status,
      status_detail: resultado.status_detail,
      transaction_amount: resultado.transaction_amount
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({
      erro: 'Erro ao processar pagamento'
    });
  }
});

// Gerar PIX
router.post('/generate-pix', paymentLimiter, authUser, [
  body('pedido_id').isUUID().withMessage('ID do pedido inválido')
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

    const { pedido_id } = req.body;
    const usuario = req.user;

    // Buscar pedido
    const pedido = await Order.findOne({
      where: { 
        id: pedido_id, 
        usuario_id: usuario.id,
        status: 'pendente'
      },
      transaction
    });

    if (!pedido) {
      await transaction.rollback();
      return res.status(404).json({
        erro: 'Pedido não encontrado ou já processado'
      });
    }

    // Verificar se usuário tem CPF cadastrado
    if (!usuario.cpf) {
      await transaction.rollback();
      return res.status(400).json({
        erro: 'CPF não cadastrado. Por favor, atualize seu perfil com um CPF válido para gerar PIX.'
      });
    }

    // Validar CPF
    if (!isValidCPF(usuario.cpf)) {
      await transaction.rollback();
      return res.status(400).json({
        erro: 'CPF inválido cadastrado. Por favor, atualize seu perfil com um CPF válido.'
      });
    }

    // Preparar dados do PIX
    const dadosPix = {
      transaction_amount: pedido.total_final,
      description: `Pedido #${pedido.id} - Eu Tenho Sonhos`,
      payer: {
        email: usuario.email,
        first_name: usuario.nome.split(' ')[0],
        last_name: usuario.nome.split(' ').slice(1).join(' ') || 'Silva',
        identification: {
          type: 'CPF',
          number: usuario.cpf // Usar CPF real do usuário
        }
      },
      external_reference: pedido.id.toString()
    };

    // Gerar PIX
    const resultado = await paymentService.gerarPix(dadosPix);

    // Atualizar pedido com informações do PIX
    await pedido.update({
      mercado_pago_payment_id: resultado.id,
      forma_pagamento: 'pix'
    }, { transaction });

    await transaction.commit();

    res.json({
      payment_id: resultado.id,
      status: resultado.status,
      qr_code: resultado.qr_code,
      qr_code_base64: resultado.qr_code_base64,
      ticket_url: resultado.ticket_url
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao gerar PIX:', error);
    res.status(500).json({
      erro: 'Erro ao gerar PIX'
    });
  }
});

// Webhook do Mercado Pago
router.post('/webhook', webhookLimiter, async (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('Webhook recebido:', webhookData);
    
    // Processar webhook
    const paymentInfo = await paymentService.processarWebhook(webhookData);
    
    if (paymentInfo && paymentInfo.external_reference) {
      // Buscar pedido
      const pedido = await Order.findOne({
        where: {
          id: paymentInfo.external_reference
        }
      });
      
      if (pedido) {
        let novoStatus = 'pendente';
        
        switch (paymentInfo.status) {
          case 'approved':
            novoStatus = 'confirmado';
            break;
          case 'pending':
            novoStatus = 'pendente';
            break;
          case 'rejected':
          case 'cancelled':
            novoStatus = 'cancelado';
            break;
        }
        
        await pedido.update({
          status: novoStatus,
          data_pagamento: paymentInfo.date_approved || null
        });
        
        console.log(`Pedido ${pedido.id} atualizado para status: ${novoStatus}`);
      }
    }
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Consultar status do pagamento
router.get('/status/:payment_id', authUser, async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    const paymentInfo = await paymentService.consultarPagamento(payment_id);
    
    res.json(paymentInfo);
    
  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);
    res.status(500).json({
      erro: 'Erro ao consultar pagamento'
    });
  }
});

// Consultar status do pagamento por ID do pedido
router.get('/order-status/:order_id', authUser, async (req, res) => {
  try {
    const { order_id } = req.params;
    
    // Buscar o pedido para obter o payment_id
    const order = await Order.findOne({
      where: { 
        id: order_id,
        usuario_id: req.user.id
      }
    });
    
    if (!order) {
      return res.status(404).json({
        erro: 'Pedido não encontrado'
      });
    }
    
    if (!order.mercado_pago_payment_id) {
      return res.status(400).json({
        erro: 'Pedido não possui pagamento associado'
      });
    }
    
    const paymentInfo = await paymentService.consultarPagamento(order.mercado_pago_payment_id);
    
    res.json(paymentInfo);
    
  } catch (error) {
    console.error('Erro ao consultar status do pedido:', error);
    res.status(500).json({
      erro: 'Erro ao consultar status do pedido'
    });
  }
});

module.exports = router;