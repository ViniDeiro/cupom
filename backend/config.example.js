// Copie este arquivo para config.js e configure suas variáveis
module.exports = {
  development: {
    port: 5000,
    database: {
      host: 'localhost',
      port: 5432,
      database: 'cupom_store',
      username: 'postgres',
      password: 'senha123',
      dialect: 'postgres',
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
        user: 'seu_email@gmail.com',
        pass: 'sua_senha_app'
      }
    },
    admin: {
      email: 'admin@loja.com',
      password: 'admin123'
    },
    correios: {
      empresa: '', // Código da empresa nos Correios (opcional)
      senha: '', // Senha da empresa nos Correios (opcional)
      token: '', // Token para rastreamento (opcional)
      cepOrigem: '01310-100' // CEP de origem padrão da loja
    }
  }
};
