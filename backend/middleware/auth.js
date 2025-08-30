const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');

let config;
try {
  config = require('../config');
} catch (error) {
  console.error('Arquivo config.js não encontrado');
  process.exit(1);
}

// Middleware para autenticar usuários
const authUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        erro: 'Token de acesso requerido' 
      });
    }

    const decoded = jwt.verify(token, config.development.jwt.secret);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.ativo) {
      return res.status(401).json({ 
        erro: 'Token inválido ou usuário inativo' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      erro: 'Token inválido' 
    });
  }
};

// Middleware para autenticar administradores
const authAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔐 AuthAdmin - Token recebido:', token ? 'Presente' : 'Ausente');
    
    if (!token) {
      console.log('❌ AuthAdmin - Token não fornecido');
      return res.status(401).json({ 
        erro: 'Token de acesso requerido' 
      });
    }

    const decoded = jwt.verify(token, config.development.jwt.secret);
    console.log('🔓 AuthAdmin - Token decodificado:', { id: decoded.id, tipo: decoded.tipo });
    
    // Verificar se o token é do tipo admin
    if (decoded.tipo !== 'admin') {
      console.log('❌ AuthAdmin - Token não é do tipo admin:', decoded.tipo);
      return res.status(401).json({ 
        erro: 'Token inválido ou administrador inativo' 
      });
    }
    
    const admin = await Admin.findByPk(decoded.id);
    console.log('👤 AuthAdmin - Admin encontrado:', admin ? `${admin.nome} (ativo: ${admin.ativo})` : 'Não encontrado');

    if (!admin || !admin.ativo) {
      console.log('❌ AuthAdmin - Admin inválido ou inativo');
      return res.status(401).json({ 
        erro: 'Token inválido ou administrador inativo' 
      });
    }

    req.admin = admin;
    console.log('✅ AuthAdmin - Autenticação bem-sucedida para:', admin.nome);
    next();
  } catch (error) {
    console.log('❌ AuthAdmin - Erro na autenticação:', error.message);
    res.status(401).json({ 
      erro: 'Token inválido' 
    });
  }
};

// Middleware para verificar nível de administrador
const requireSuperAdmin = (req, res, next) => {
  if (req.admin.nivel !== 'super') {
    return res.status(403).json({ 
      erro: 'Acesso negado. Requer nível super administrador.' 
    });
  }
  next();
};

module.exports = {
  authUser,
  authAdmin,
  requireSuperAdmin
};
