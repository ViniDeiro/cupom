// Carregar variáveis de ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize, testConnection } = require('./config/database');
const { User, Admin, Product, Coupon, SpecialDay, Order, OrderItem } = require('./models');

let config;
try {
  config = require('./config');
} catch (error) {
  console.error('❌ Arquivo config.js não encontrado. Copie config.example.js para config.js e configure suas variáveis.');
  process.exit(1);
}

const app = express();
const PORT = config.development.port || 5000;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', req.body);
  }
  next();
});

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:`, req.body);
  }
  next();
});

// Middleware para capturar todas as requisições
app.use('*', (req, res, next) => {
  console.log(`🔍 Requisição capturada: ${req.method} ${req.originalUrl}`);
  next();
});

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
console.log('🔧 Carregando rota coupon-payments...');
try {
  const couponPaymentsRouter = require('./routes/couponPayments');
  app.use('/api/coupon-payments', couponPaymentsRouter);
  console.log('✅ Rota coupon-payments carregada com sucesso!');
} catch (error) {
  console.error('❌ Erro ao carregar rota coupon-payments:', error);
}
app.use('/api/config', require('./routes/config'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin', require('./routes/couponTypeRoutes'));
app.use('/api/correios', require('./routes/correios'));

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API da Loja Cupom - Sistema de cupons especiais',
    versao: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      coupons: '/api/coupons',
      orders: '/api/orders',
      admin: '/api/admin'
    }
  });
});

// Middleware de erro 404 - DEVE SER O ÚLTIMO MIDDLEWARE
app.use('*', (req, res) => {
  console.log('🚫 404 - Endpoint não encontrado:', req.originalUrl);
  res.status(404).json({
    erro: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro:', error);
  
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      erro: 'Erro de validação',
      detalhes: error.errors.map(e => ({
        campo: e.path,
        mensagem: e.message
      }))
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      erro: 'Violação de restrição única',
      detalhes: error.errors.map(e => ({
        campo: e.path,
        mensagem: 'Este valor já existe'
      }))
    });
  }

  res.status(500).json({
    erro: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// Função para inicializar dados básicos
async function inicializarDados() {
  try {
    // Verificar se já existe um admin
    const adminExistente = await Admin.findOne();
    
    if (!adminExistente) {
      console.log('🔧 Criando administrador padrão...');
      await Admin.create({
        nome: 'Administrador',
        email: config.development.admin.email,
        senha: config.development.admin.password,
        nivel: 'super'
      });
      console.log('✅ Administrador padrão criado!');
      console.log(`   Email: ${config.development.admin.email}`);
      console.log(`   Senha: ${config.development.admin.password}`);
    }

    // Criar alguns produtos de exemplo
    const produtoExistente = await Product.findOne();
    
    if (!produtoExistente) {
      console.log('🔧 Criando produtos de exemplo...');
      
      const produtosExemplo = [
        {
          nome: 'Smartphone Premium',
          descricao: 'Smartphone com tecnologia avançada e design moderno',
          preco: 1200.00,
          preco_desconto: 999.00,
          categoria: 'Eletrônicos',
          estoque: 50,
          disponivel_dias_especiais: false
        },
        {
          nome: 'Notebook Gamer',
          descricao: 'Notebook para jogos com placa de vídeo dedicada',
          preco: 2500.00,
          preco_desconto: 2100.00,
          categoria: 'Eletrônicos',
          estoque: 25,
          disponivel_dias_especiais: false
        },
        {
          nome: 'Tênis Esportivo Exclusivo',
          descricao: 'Tênis edição limitada para colecionadores',
          preco: 800.00,
          preco_desconto: 400.00,
          categoria: 'Calçados',
          estoque: 10,
          disponivel_dias_especiais: true
        },
        {
          nome: 'Relógio Smart Premium',
          descricao: 'Smartwatch com todas as funcionalidades premium',
          preco: 1500.00,
          preco_desconto: 750.00,
          categoria: 'Acessórios',
          estoque: 15,
          disponivel_dias_especiais: true
        }
      ];

      for (const produto of produtosExemplo) {
        await Product.create(produto);
      }
      
      console.log('✅ Produtos de exemplo criados!');
    }

  } catch (error) {
    console.error('❌ Erro ao inicializar dados:', error);
  }
}

// Função para iniciar o servidor
async function iniciarServidor() {
  try {
    // Testar conexão com banco
    await testConnection();
    
    // Sincronizar modelos com banco
    console.log('🔧 Sincronizando banco de dados...');
    await sequelize.sync({ force: false }); // Mude para true apenas se quiser recriar as tabelas
    console.log('✅ Banco sincronizado!');
    
    // Inicializar dados básicos
    await inicializarDados();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
🚀 Servidor rodando na porta ${PORT}
📱 API: http://localhost:${PORT}
🔍 Health: http://localhost:${PORT}/api/health
👨‍💼 Admin: http://localhost:${PORT}/api/admin/dashboard

📋 Endpoints disponíveis:
   • POST /api/auth/register - Registro de usuário
   • POST /api/auth/login - Login de usuário
   • POST /api/auth/admin/login - Login administrativo
   • GET /api/products - Listar produtos
   • GET /api/coupons/tipos - Tipos de cupons
   • POST /api/coupons/comprar - Comprar cupom
   • GET /api/coupons/dia-especial - Verificar dia especial
      `);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratar encerramento gracioso
process.on('SIGINT', async () => {
  console.log('\n🔄 Encerrando servidor...');
  
  try {
    await sequelize.close();
    console.log('✅ Conexões fechadas.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao encerrar:', error);
    process.exit(1);
  }
});

// Iniciar aplicação
iniciarServidor();
