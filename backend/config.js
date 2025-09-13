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
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
      publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY,
      clientId: process.env.MERCADO_PAGO_CLIENT_ID,
      clientSecret: process.env.MERCADO_PAGO_CLIENT_SECRET
    },
    frontend: {
      url: 'http://localhost:3000'
    },
    backend: {
      url: 'http://localhost:5000'
    },
    correios: {
      empresa: process.env.CORREIOS_EMPRESA || '', // Código da empresa nos Correios (opcional)
      senha: process.env.CORREIOS_SENHA || '', // Senha da empresa nos Correios (opcional)
      token: process.env.CORREIOS_TOKEN || '', // Token para rastreamento (opcional)
      cepOrigem: process.env.CORREIOS_CEP_ORIGEM || '01310-100' // CEP de origem padrão da loja
    }
  }
};