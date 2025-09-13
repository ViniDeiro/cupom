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

// Login unificado (usuário e administrador)
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').optional().notEmpty().withMessage('Senha é obrigatória'),
  body('password').optional().notEmpty().withMessage('Password é obrigatório')
], async (req, res) => {
  try {
    console.log('🔐 Login - Iniciando processo de login');
    console.log('🔐 Login - Dados recebidos:', { email: req.body.email, senha: req.body.senha ? '[PRESENTE]' : '[AUSENTE]' });
    
    const errors = validationResult(req);
    
    // Verificar se pelo menos uma senha foi fornecida
    if (!req.body.senha && !req.body.password) {
      console.log('❌ Login - Nenhuma senha fornecida');
      return res.status(400).json({
        erro: 'Senha é obrigatória'
      });
    }
    
    // Filtrar erros relacionados a senha/password já que fazemos verificação manual
    const filteredErrors = errors.array().filter(error => 
      error.path !== 'senha' && error.path !== 'password'
    );
    
    if (filteredErrors.length > 0) {
      console.log('❌ Login - Dados inválidos:', filteredErrors);
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: filteredErrors
      });
    }

    const { email, senha, password } = req.body;
    const senhaFinal = senha || password; // Aceita tanto 'senha' quanto 'password'
    console.log('🔐 Login - Email normalizado:', email);
    console.log('🔐 Login - Senha recebida como:', senha ? 'senha' : password ? 'password' : 'nenhuma');

    // Primeiro tenta buscar como usuário
    console.log('🔍 Login - Buscando usuário com email:', email);
    const usuario = await User.findOne({ where: { email } });
    console.log('👤 Login - Usuário encontrado:', usuario ? `ID: ${usuario.id}, Ativo: ${usuario.ativo}` : 'Não encontrado');
    
    if (usuario && usuario.ativo) {
      console.log('🔐 Login - Verificando senha do usuário...');
      // Verificar senha do usuário
      const senhaValida = await usuario.verificarSenha(senhaFinal);
      console.log('🔐 Login - Senha válida:', senhaValida);
      
      if (senhaValida) {
        console.log('✅ Login - Gerando token para usuário...');
        // Gerar token para usuário
        const token = gerarToken(usuario.id, 'user');
        console.log('✅ Login - Token gerado com sucesso para usuário:', usuario.email);

        return res.json({
          mensagem: 'Login realizado com sucesso',
          token,
          usuario
        });
      }
    }

    // Se não encontrou usuário ou senha inválida, tenta como administrador
    console.log('🔍 Login - Buscando administrador com email:', email);
    const admin = await Admin.findOne({ where: { email } });
    console.log('👨‍💼 Login - Admin encontrado:', admin ? `ID: ${admin.id}, Ativo: ${admin.ativo}` : 'Não encontrado');
    
    if (admin && admin.ativo) {
      console.log('🔐 Login - Verificando senha do administrador...');
      // Verificar senha do administrador
      const senhaValida = await admin.verificarSenha(senhaFinal);
      console.log('🔐 Login - Senha admin válida:', senhaValida);
      
      if (senhaValida) {
        console.log('✅ Login - Gerando token para administrador...');
        // Gerar token para administrador
        const token = gerarToken(admin.id, 'admin');
        console.log('✅ Login - Token gerado com sucesso para admin:', admin.email);

        return res.json({
          mensagem: 'Login administrativo realizado com sucesso',
          token,
          admin
        });
      }
    }

    // Se chegou aqui, não encontrou usuário ou admin válido
    console.log('❌ Login - Credenciais inválidas para email:', email);
    return res.status(401).json({
      erro: 'Credenciais inválidas'
    });

  } catch (error) {
    console.error('❌ Login - Erro no login:', error);
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
