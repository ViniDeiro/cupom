// Servidor adaptado para Vercel Functions
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize, testConnection } = require('../backend/config/database');
const { User, Admin, Product, Coupon, SpecialDay, Order, OrderItem } = require('../backend/models');

let config;
try {
  config = require('../backend/config');
} catch (error) {
  console.error('❌ Arquivo config.js não encontrado.');
  throw error;
}

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: true, // Permite qualquer origem em produção
  credentials: true
}));

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/products', require('../backend/routes/products'));
app.use('/api/coupons', require('../backend/routes/coupons'));
app.use('/api/orders', require('../backend/routes/orders'));
app.use('/api/payments', require('../backend/routes/payments'));

try {
  app.use('/api/coupon-payments', require('../backend/routes/couponPayments'));
  console.log('✅ Rota coupon-payments carregada com sucesso!');
} catch (error) {
  console.error('❌ Erro ao carregar rota coupon-payments:', error);
}

app.use('/api/config', require('../backend/routes/config'));
app.use('/api/admin', require('../backend/routes/admin'));
app.use('/api/admin', require('../backend/routes/couponTypeRoutes'));
app.use('/api/correios', require('../backend/routes/correios'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz da API
app.get('/api', (req, res) => {
  res.json({
    message: '🎯 API da Loja de Cupons',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/register - Registro de usuário',
      'POST /api/auth/login - Login de usuário',
      'POST /api/auth/admin/login - Login administrativo',
      'GET /api/products - Listar produtos',
      'GET /api/coupons/tipos - Tipos de cupons',
      'POST /api/coupons/comprar - Comprar cupom',
      'GET /api/coupons/dia-especial - Verificar dia especial'
    ]
  });
});

// Middleware de erro
app.use((error, req, res, next) => {
  console.error('❌ Erro no servidor:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: error.message
    });
  }
  
  if (error.name === 'SequelizeConnectionError') {
    return res.status(500).json({
      erro: 'Erro de conexão com banco de dados'
    });
  }
  
  res.status(500).json({
    erro: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// Inicialização do banco (apenas uma vez)
let dbInitialized = false;

async function initializeDatabase() {
  if (dbInitialized) return;
  
  try {
    console.log('🔧 Conectando ao banco de dados...');
    await testConnection();
    console.log('✅ Conexão com banco estabelecida.');
    
    console.log('🔧 Sincronizando banco de dados...');
    await sequelize.sync({ alter: false });
    console.log('✅ Banco sincronizado!');
    
    dbInitialized = true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    throw error;
  }
}

// Handler principal para Vercel
module.exports = async (req, res) => {
  try {
    await initializeDatabase();
    return app(req, res);
  } catch (error) {
    console.error('❌ Erro na função:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Para desenvolvimento local
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  });
}