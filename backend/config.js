require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Configuração para desenvolvimento
const development = {
  port: process.env.PORT || 5000,
  database: isProduction ? {
    dialect: 'postgres',
    url: process.env.DATABASE_URL,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  } : {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui',
    expiresIn: '7d'
  },
  email: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'eutenhosonhos5@gmail.com',
      pass: process.env.EMAIL_PASS || 'ggzq zwgd skfa gzqv'
    }
  },
  admin: {
    email: 'admin@loja.com',
    password: 'admin123'
  },
  mercadoPago: {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY,
    clientId: process.env.MERCADO_PAGO_CLIENT_ID,
    clientSecret: process.env.MERCADO_PAGO_CLIENT_SECRET
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:5000'
  },
  correios: {
    empresa: process.env.CORREIOS_EMPRESA || '',
    senha: process.env.CORREIOS_SENHA || '',
    token: process.env.CORREIOS_TOKEN || '',
    cepOrigem: process.env.CORREIOS_CEP_ORIGEM || '01310-100'
  }
};

// Configuração para produção (Vercel)
const production = {
  port: process.env.PORT || 3000,
  database: {
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  },
  email: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@loja.com',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  mercadoPago: {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY,
    clientId: process.env.MERCADO_PAGO_CLIENT_ID,
    clientSecret: process.env.MERCADO_PAGO_CLIENT_SECRET
  },
  frontend: {
    url: process.env.FRONTEND_URL
  },
  backend: {
    url: process.env.BACKEND_URL
  },
  correios: {
    empresa: process.env.CORREIOS_EMPRESA || '',
    senha: process.env.CORREIOS_SENHA || '',
    token: process.env.CORREIOS_TOKEN || '',
    cepOrigem: process.env.CORREIOS_CEP_ORIGEM || '01310-100'
  }
};

module.exports = {
  development,
  production
};