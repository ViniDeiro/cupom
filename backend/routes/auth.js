const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Admin } = require('../models');

let config;
try {
  config = require('../config');
} catch (error) {
  console.error('Arquivo config.js não encontrado');
  process.exit(1);
}

const router = express.Router();

// Função para gerar token JWT
const gerarToken = (id, tipo = 'user') => {
  return jwt.sign({ id, tipo }, config.development.jwt.secret, {
    expiresIn: config.development.jwt.expiresIn
  });
};

// Registro de usuário
router.post('/register', [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('telefone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { nome, email, senha, telefone } = req.body;

    // Verificar se usuário já existe
    const usuarioExistente = await User.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({
        erro: 'Usuário já existe com este email'
      });
    }

    // Criar usuário
    const usuario = await User.create({
      nome,
      email,
      senha,
      telefone
    });

    // Gerar token
    const token = gerarToken(usuario.id);

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      token,
      usuario
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Login de usuário
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { email, senha } = req.body;

    // Buscar usuário
    const usuario = await User.findOne({ where: { email } });
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        erro: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const senhaValida = await usuario.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Credenciais inválidas'
      });
    }

    // Gerar token
    const token = gerarToken(usuario.id);

    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

// Login de administrador
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { email, senha } = req.body;

    // Buscar administrador
    const admin = await Admin.findOne({ where: { email } });
    if (!admin || !admin.ativo) {
      return res.status(401).json({
        erro: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const senhaValida = await admin.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Credenciais inválidas'
      });
    }

    // Gerar token
    const token = gerarToken(admin.id, 'admin');

    res.json({
      mensagem: 'Login administrativo realizado com sucesso',
      token,
      admin
    });

  } catch (error) {
    console.error('Erro no login admin:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
