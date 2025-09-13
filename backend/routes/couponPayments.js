const express = require('express');
const { body, validationResult } = require('express-validator');
const { Coupon, User, CouponType } = require('../models');
const { authUser } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const { sequelize } = require('../config/database');
const rateLimit = require('express-rate-limit');

// Rate limiting para pagamentos de cupons
const couponPaymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 tentativas de compra de cupom por IP
  message: {
    erro: 'Muitas tentativas de compra de cupom. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const router = express.Router();

// Rota de teste para verificar se o endpoint está funcionando
router.get('/', (req, res) => {
  res.json({
    message: 'Endpoint coupon-payments funcionando!',
    endpoints: [
      'POST /buy-coupon-pix - Comprar cupom com PIX',
      'GET /coupon-payment-status/:payment_id - Verificar status do pagamento'
    ]
  });
});

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

// Comprar cupom com PIX
router.post('/buy-coupon-pix', (req, res, next) => {
  console.log('🎯 Rota buy-coupon-pix foi chamada!');
  console.log('🎯 Method:', req.method);
  console.log('🎯 URL:', req.url);
  console.log('🎯 Body:', req.body);
  next();
}, /* couponPaymentLimiter, */ authUser, [
  body('tipo_cupom_id').isInt({ min: 1 }).withMessage('Tipo de cupom inválido'),
  body('cpf').optional().isString().withMessage('CPF deve ser uma string')
], async (req, res) => {
  console.log('🛒 Requisição de compra recebida:', req.body);
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erro de validação:', errors.array());
      await transaction.rollback();
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { tipo_cupom_id, cpf: cpfFornecido } = req.body;
    let usuario = req.user;
    let cpfParaUsar = usuario.cpf;
    
    console.log('=== DEBUG COMPRA CUPOM ===');
    console.log('Dados recebidos:', { tipo_cupom_id, cpfFornecido });
    console.log('Usuário atual:', { id: usuario.id, nome: usuario.nome, cpf: usuario.cpf });
    console.log('========================');

    // Se CPF foi fornecido na requisição, validar e usar
    console.log('🔍 Verificando se CPF foi fornecido:', cpfFornecido);
    if (cpfFornecido) {
      console.log('📝 CPF fornecido, processando...');
      const cpfLimpo = cpfFornecido.replace(/\D/g, '');
      console.log('🧹 CPF limpo:', cpfLimpo);
      
      console.log('🔍 Validando CPF fornecido...');
      if (!isValidCPF(cpfLimpo)) {
        console.log('❌ CPF fornecido é inválido:', cpfLimpo);
        await transaction.rollback();
        return res.status(400).json({
          erro: 'CPF inválido. Por favor, verifique o CPF informado.'
        });
      }
      
      // Verificar se CPF já está em uso por outro usuário
      const usuarioComCpf = await User.findOne({ 
        where: { cpf: cpfLimpo, id: { [require('sequelize').Op.ne]: usuario.id } } 
      });
      
      if (usuarioComCpf) {
        await transaction.rollback();
        return res.status(400).json({
          erro: 'Este CPF já está cadastrado por outro usuário.'
        });
      }
      
      // Atualizar usuário com o CPF fornecido
      await usuario.update({ cpf: cpfLimpo }, { transaction });
      cpfParaUsar = cpfLimpo;
    }
    
    // Verificar se usuário tem CPF (cadastrado ou fornecido)
    console.log('🔍 CPF para usar:', cpfParaUsar);
    if (!cpfParaUsar) {
      console.log('❌ CPF não encontrado');
      await transaction.rollback();
      return res.status(400).json({
        erro: 'CPF não cadastrado. Por favor, informe seu CPF para comprar cupons com PIX.'
      });
    }

    // Validar CPF final
    console.log('🔍 Validando CPF final:', cpfParaUsar);
    if (!isValidCPF(cpfParaUsar)) {
      console.log('❌ CPF inválido:', cpfParaUsar);
      await transaction.rollback();
      return res.status(400).json({
        erro: 'CPF inválido. Por favor, verifique o CPF informado.'
      });
    }
    console.log('✅ CPF válido:', cpfParaUsar);

    // Buscar tipo de cupom
    console.log('🔍 Buscando tipo de cupom ID:', tipo_cupom_id);
    const tipoCupom = await CouponType.findByPk(tipo_cupom_id);
    
    console.log('📋 Tipo de cupom encontrado:', tipoCupom ? `${tipoCupom.nome} (ativo: ${tipoCupom.ativo})` : 'Não encontrado');
    if (!tipoCupom || !tipoCupom.ativo) {
      console.log('❌ Tipo de cupom inválido');
      await transaction.rollback();
      return res.status(404).json({
        erro: 'Tipo de cupom não encontrado ou inativo'
      });
    }

    // Gerar código único para o cupom
    let codigo;
    let codigoExiste = true;
    while (codigoExiste) {
      codigo = Coupon.gerarCodigo();
      const cupomExistente = await Coupon.findOne({ where: { codigo } });
      codigoExiste = !!cupomExistente;
    }

    // Calcular data de validade
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + tipoCupom.validade_dias);

    // Criar cupom com status pendente
    const cupom = await Coupon.create({
      codigo,
      usuario_id: usuario.id,
      tipo_id: tipoCupom.id,
      valor_pago: tipoCupom.preco,
      desconto_percentual: tipoCupom.desconto,
      data_validade: dataValidade,
      status_pagamento: 'pendente', // Adicionar este campo ao modelo se não existir
      ativo: false // Cupom só fica ativo após pagamento confirmado
    }, { transaction });

    // Preparar dados do PIX
    const timestamp = Date.now();
    const dadosPix = {
      transaction_amount: tipoCupom.preco,
      description: `Cupom ${tipoCupom.nome} - ${codigo} - ${timestamp}`,
      payer: {
        email: usuario.email,
        first_name: usuario.nome.split(' ')[0],
        last_name: usuario.nome.split(' ').slice(1).join(' ') || 'Silva',
        identification: {
          type: 'CPF',
          number: cpfParaUsar
        }
      },
      external_reference: `${cupom.id}-${timestamp}`
    };

    // Gerar PIX
    const resultado = await paymentService.gerarPix(dadosPix);

    // Atualizar cupom com informações do PIX
    await cupom.update({
      mercado_pago_payment_id: resultado.id
    }, { transaction });

    await transaction.commit();

    res.json({
      cupom: {
        id: cupom.id,
        codigo: cupom.codigo,
        tipo: tipoCupom.nome,
        desconto: cupom.desconto_percentual,
        valor: cupom.valor_pago,
        validade: cupom.data_validade
      },
      pix: {
        payment_id: resultado.id,
        status: resultado.status,
        qr_code: resultado.qr_code,
        qr_code_base64: resultado.qr_code_base64,
        ticket_url: resultado.ticket_url
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao comprar cupom com PIX:', error);
    res.status(500).json({
      erro: 'Erro ao processar compra do cupom'
    });
  }
});

// Verificar status do pagamento do cupom
router.get('/coupon-payment-status/:payment_id', authUser, async (req, res) => {
  try {
    const { payment_id } = req.params;
    const usuario = req.user;

    // Buscar cupom pelo payment_id
    const cupom = await Coupon.findOne({
      where: {
        mercado_pago_payment_id: payment_id,
        usuario_id: usuario.id
      },
      include: [{
        model: CouponType,
        as: 'tipo'
      }]
    });

    if (!cupom) {
      return res.status(404).json({
        erro: 'Cupom não encontrado'
      });
    }

    // Consultar status no Mercado Pago
    const paymentInfo = await paymentService.consultarPagamento(payment_id);

    // Atualizar status do cupom se necessário
    if (paymentInfo.status === 'approved' && !cupom.ativo) {
      await cupom.update({
        status_pagamento: 'aprovado',
        ativo: true
      });
      
      // Enviar email com o cupom quando ativado
      const emailService = require('../services/emailService');
      const resultadoEmail = await emailService.enviarCupom(cupom.usuario, cupom);
      
      if (resultadoEmail.sucesso) {
        console.log(`📧 Email enviado com sucesso para ${cupom.usuario.email}`);
      } else {
        console.error('❌ Erro ao enviar email:', resultadoEmail.erro);
      }
    } else if (paymentInfo.status === 'rejected') {
      await cupom.update({
        status_pagamento: 'rejeitado'
      });
    }

    res.json({
      cupom: {
        id: cupom.id,
        codigo: cupom.codigo,
        status_pagamento: cupom.status_pagamento,
        ativo: cupom.ativo
      },
      pagamento: {
        status: paymentInfo.status,
        status_detail: paymentInfo.status_detail
      }
    });

  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    res.status(500).json({
      erro: 'Erro ao verificar status do pagamento'
    });
  }
});

// Webhook específico para pagamentos de cupons
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('🔔 Webhook de cupom recebido:', webhookData);
    
    // Processar webhook
    const paymentInfo = await paymentService.processarWebhook(webhookData);
    
    if (paymentInfo && paymentInfo.external_reference) {
      // Extrair cupom ID do external_reference (formato: cupomId-timestamp)
      const cupomId = paymentInfo.external_reference.split('-')[0];
      
      // Buscar cupom
      const cupom = await Coupon.findOne({
        where: {
          id: cupomId
        },
        include: [{
          model: User,
          as: 'usuario'
        }, {
          model: CouponType,
          as: 'tipo'
        }]
      });
      
      if (cupom) {
        console.log(`📋 Cupom encontrado: ${cupom.codigo}`);
        
        if (paymentInfo.status === 'approved' && !cupom.ativo) {
          console.log('✅ Pagamento aprovado! Ativando cupom e enviando email...');
          
          // Ativar cupom
          await cupom.update({
            status_pagamento: 'aprovado',
            ativo: true
          });
          
          // Enviar email com o cupom
          const emailService = require('../services/emailService');
          const resultadoEmail = await emailService.enviarCupom(cupom.usuario, cupom);
          
          if (resultadoEmail.sucesso) {
            console.log(`📧 Email enviado com sucesso para ${cupom.usuario.email}`);
          } else {
            console.error('❌ Erro ao enviar email:', resultadoEmail.erro);
          }
          
          console.log(`🎉 Cupom ${cupom.codigo} ativado e email enviado!`);
        } else if (paymentInfo.status === 'rejected') {
          console.log('❌ Pagamento rejeitado');
          await cupom.update({
            status_pagamento: 'rejeitado'
          });
        }
      } else {
        console.log('⚠️ Cupom não encontrado para o external_reference:', paymentInfo.external_reference);
      }
    }
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook de cupom:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;