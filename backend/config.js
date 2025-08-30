// Configuração para desenvolvimento
module.exports = {
  development: {
    port: 5000,
    database: {
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false
    },
    jwt: {
      secret: 'sua_chave_secreta_super_segura_aqui',
      expiresIn: '7d'
    },
    email: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'viniciusdeirolopes@gmail.com',
      pass: 'ggzq zwgd skfa gzqv'
    }
  },
    admin: {
      email: 'admin@loja.com',
      password: 'admin123'
    },
    mercadoPago: {
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-YOUR-ACCESS-TOKEN-HERE',
      publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || 'TEST-YOUR-PUBLIC-KEY-HERE'
    },
    frontend: {
      url: 'http://localhost:3000'
    },
    backend: {
      url: 'http://localhost:5000'
    }
  }
};