const express = require('express');
const { body, validationResult } = require('express-validator');
const { Coupon, User, SpecialDay } = require('../models');
const { authUser } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Listar tipos de cupons disponíveis para compra
router.get('/tipos', async (req, res) => {
  try {
    const tiposCupons = [
      {
        id: 1,
        nome: 'Cupom Bronze',
        desconto: 10,
        preco: 25.00,
        descricao: 'Desconto de 10% em produtos selecionados',
        validade_dias: 90
      },
      {
        id: 2,
        nome: 'Cupom Prata',
        desconto: 20,
        preco: 45.00,
        descricao: 'Desconto de 20% em produtos selecionados',
        validade_dias: 90
      },
      {
        id: 3,
        nome: 'Cupom Ouro',
        desconto: 30,
        preco: 65.00,
        descricao: 'Desconto de 30% em produtos selecionados',
        validade_dias: 90
      },
      {
        id: 4,
        nome: 'Cupom Diamante',
        desconto: 50,
        preco: 100.00,
        descricao: 'Desconto de 50% em produtos selecionados',
        validade_dias: 90
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

// Comprar cupom
router.post('/comprar', authUser, [
  body('tipo_cupom_id').isInt({ min: 1, max: 4 }).withMessage('Tipo de cupom inválido'),
  body('forma_pagamento').isIn(['pix', 'cartao', 'boleto']).withMessage('Forma de pagamento inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { tipo_cupom_id, forma_pagamento } = req.body;
    const usuario = req.user;

    // Configurações dos tipos de cupons
    const configCupons = {
      1: { desconto: 10, preco: 25.00, nome: 'Bronze' },
      2: { desconto: 20, preco: 45.00, nome: 'Prata' },
      3: { desconto: 30, preco: 65.00, nome: 'Ouro' },
      4: { desconto: 50, preco: 100.00, nome: 'Diamante' }
    };

    const configCupom = configCupons[tipo_cupom_id];
    
    // Gerar código único
    let codigo;
    let codigoExiste = true;
    while (codigoExiste) {
      codigo = Coupon.gerarCodigo();
      const cupomExistente = await Coupon.findOne({ where: { codigo } });
      codigoExiste = !!cupomExistente;
    }

    // Calcular data de validade (90 dias)
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 90);

    // Criar cupom
    const cupom = await Coupon.create({
      codigo,
      usuario_id: usuario.id,
      valor_pago: configCupom.preco,
      desconto_percentual: configCupom.desconto,
      data_validade: dataValidade
    });

    // Enviar cupom por email
    const resultadoEmail = await emailService.enviarCupom(usuario, cupom);
    
    if (!resultadoEmail.sucesso) {
      console.error('Erro ao enviar email:', resultadoEmail.erro);
      // Cupom foi criado mas email falhou - informar ao usuário
    }

    res.status(201).json({
      mensagem: 'Cupom comprado com sucesso!',
      cupom: {
        codigo: cupom.codigo,
        desconto: cupom.desconto_percentual,
        validade: cupom.data_validade,
        tipo: configCupom.nome
      },
      email_enviado: resultadoEmail.sucesso
    });

  } catch (error) {
    console.error('Erro ao comprar cupom:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Listar cupons do usuário
router.get('/meus-cupons', authUser, async (req, res) => {
  try {
    const cupons = await Coupon.findAll({
      where: { usuario_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    const cuponsFormatados = cupons.map(cupom => ({
      id: cupom.id,
      codigo: cupom.codigo,
      desconto: cupom.desconto_percentual,
      valor_pago: cupom.valor_pago,
      data_compra: cupom.data_compra,
      data_validade: cupom.data_validade,
      usado: cupom.usado,
      data_uso: cupom.data_uso,
      valido: cupom.isValido(),
      ativo: cupom.ativo
    }));

    res.json({
      cupons: cuponsFormatados
    });
  } catch (error) {
    console.error('Erro ao listar cupons:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Validar cupom
router.post('/validar', authUser, [
  body('codigo').notEmpty().withMessage('Código do cupom é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { codigo } = req.body;

    // Verificar se é um dia especial
    const diaEspecial = await SpecialDay.isHojeDiaEspecial();
    if (!diaEspecial) {
      return res.status(400).json({
        erro: 'Cupons só podem ser usados em dias especiais de desconto'
      });
    }

    // Buscar cupom
    const cupom = await Coupon.findOne({
      where: { 
        codigo,
        usuario_id: req.user.id 
      }
    });

    if (!cupom) {
      return res.status(404).json({
        erro: 'Cupom não encontrado'
      });
    }

    // Verificar se cupom é válido
    if (!cupom.isValido()) {
      let motivo = 'Cupom inválido';
      if (cupom.usado) motivo = 'Cupom já foi utilizado';
      else if (!cupom.ativo) motivo = 'Cupom inativo';
      else if (new Date() > cupom.data_validade) motivo = 'Cupom expirado';

      return res.status(400).json({
        erro: motivo
      });
    }

    res.json({
      mensagem: 'Cupom válido!',
      cupom: {
        codigo: cupom.codigo,
        desconto: cupom.desconto_percentual,
        validade: cupom.data_validade
      },
      dia_especial: {
        nome: diaEspecial.nome,
        descricao: diaEspecial.descricao,
        desconto_adicional: diaEspecial.desconto_geral
      }
    });

  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Verificar se hoje é dia especial (rota pública)
router.get('/dia-especial', async (req, res) => {
  try {
    const diaEspecial = await SpecialDay.isHojeDiaEspecial();
    
    if (!diaEspecial) {
      return res.json({
        dia_especial: false,
        mensagem: 'Hoje não é um dia especial. Aguarde nossa comunicação!'
      });
    }

    res.json({
      dia_especial: true,
      evento: {
        nome: diaEspecial.nome,
        descricao: diaEspecial.descricao,
        desconto_adicional: diaEspecial.desconto_geral,
        termina_em: diaEspecial.data_fim
      }
    });

  } catch (error) {
    console.error('Erro ao verificar dia especial:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
