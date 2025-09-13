const { sequelize } = require('../config/database');
const { Admin } = require('../models');
const bcrypt = require('bcryptjs');

async function reiniciarServidor() {
  try {
    console.log('Forçando sincronização do banco de dados...');
    // Força a recriação de todas as tabelas
    await sequelize.sync({ force: true });
    console.log('Banco de dados sincronizado com sucesso!');
    
    // Criar super administrador
    console.log('Criando super administrador...');
    const superAdmin = await Admin.create({
      nome: 'Super Admin',
      email: 'superadmin@loja.com',
      senha: await bcrypt.hash('superadmin123', 12),
      nivel: 'super'
    });
    
    console.log('Super administrador criado com sucesso:');
    console.log('ID:', superAdmin.id);
    console.log('Email: superadmin@loja.com');
    console.log('Senha: superadmin123');
    
    // Criar administrador padrão
    console.log('\nCriando administrador padrão...');
    const adminPadrao = await Admin.create({
      nome: 'Administrador',
      email: 'admin@loja.com',
      senha: await bcrypt.hash('admin123', 12),
      nivel: 'admin'
    });
    
    console.log('Administrador padrão criado com sucesso:');
    console.log('ID:', adminPadrao.id);
    console.log('Email: admin@loja.com');
    console.log('Senha: admin123');
    
    console.log('\nReiniciação concluída! Agora você pode reiniciar o servidor.');
  } catch (error) {
    console.error('Erro ao reiniciar servidor:', error);
  } finally {
    process.exit(0);
  }
}

// Confirmação antes de executar
console.log('ATENÇÃO: Este script irá APAGAR todos os dados do banco e recriar as tabelas!');
console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos para continuar...');

setTimeout(() => {
  console.log('Iniciando reinicialização...');
  reiniciarServidor();
}, 5000);