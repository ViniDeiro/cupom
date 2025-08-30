const express = require('express');
const { body, validationResult } = require('express-validator');
const { authAdmin } = require('../middleware/auth');
const { CouponType } = require('../models');

const router = express.Router();

// Listar todos os tipos de cupons
router.get('/tipos-cupons', authAdmin, async (req, res) => {
  try {
    const tiposCupons = await CouponType.findAll({
      where: { ativo: true },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      tipos_cupons: tiposCupons
    });
  } catch (error) {
    console.error('Erro ao listar tipos de cupons:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Criar novo tipo de cupom
router.post('/tipos-cupons', authAdmin, [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao').optional().trim(),
  body('desconto').isFloat({ min: 0.01, max: 100 }).withMessage('Desconto deve ser entre 0.01 e 100'),
  body('validade_dias').isInt({ min: 1 }).withMessage('Validade deve ser pelo menos 1 dia')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { nome, descricao, desconto, validade_dias } = req.body;

    const tipoCupom = await CouponType.create({
      nome,
      descricao,
      desconto,
      validade_dias
    });

    res.status(201).json({
      mensagem: 'Tipo de cupom criado com sucesso',
      tipo_cupom: tipoCupom
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
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao').optional().trim(),
  body('desconto').isFloat({ min: 0.01, max: 100 }).withMessage('Desconto deve ser entre 0.01 e 100'),
  body('validade_dias').isInt({ min: 1 }).withMessage('Validade deve ser pelo menos 1 dia')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const tipoCupom = await CouponType.findByPk(req.params.id);
    
    if (!tipoCupom) {
      return res.status(404).json({
        erro: 'Tipo de cupom não encontrado'
      });
    }

    const { nome, descricao, desconto, validade_dias } = req.body;

    await tipoCupom.update({
      nome,
      descricao,
      desconto,
      validade_dias
    });

    res.json({
      mensagem: 'Tipo de cupom atualizado com sucesso',
      tipo_cupom: tipoCupom
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
    const tipoCupom = await CouponType.findByPk(req.params.id);
    
    if (!tipoCupom) {
      return res.status(404).json({
        erro: 'Tipo de cupom não encontrado'
      });
    }

    await tipoCupom.update({ ativo: false });

    res.json({
      mensagem: 'Tipo de cupom removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar tipo de cupom:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

module.exports = router;