const { Sequelize } = require('sequelize');

let config;
try {
  config = require('../config');
} catch (error) {
  console.error('Arquivo config.js não encontrado. Copie config.example.js para config.js');
  process.exit(1);
}

const dbConfig = config.development.database;

const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: dbConfig.logging,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Teste de conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
  }
}

module.exports = { sequelize, testConnection };
