const { sequelize } = require('../config/database');
const { QueryInterface, DataTypes } = require('sequelize');

// Script para adicionar campo CPF ao modelo User

async function adicionarCampoCpf() {
  try {
    console.log('🔧 Adicionando campo CPF ao modelo User...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Verificar se a coluna CPF já existe
    const tableDescription = await queryInterface.describeTable('usuarios');
    
    if (tableDescription.cpf) {
      console.log('✅ Campo CPF já existe na tabela usuarios');
      return;
    }
    
    // Adicionar coluna CPF
    await queryInterface.addColumn('usuarios', 'cpf', {
      type: DataTypes.STRING(11),
      allowNull: true, // Permitir null inicialmente para usuários existentes
      unique: true,
      validate: {
        len: [11, 11], // CPF deve ter exatamente 11 dígitos
        isNumeric: true // Apenas números
      }
    });
    
    console.log('✅ Campo CPF adicionado com sucesso à tabela usuarios!');
    
    // Atualizar modelo User.js
    console.log('\n📝 Agora você precisa atualizar o arquivo models/User.js');
    console.log('Adicione o campo CPF ao modelo:');
    console.log(`
cpf: {
  type: DataTypes.STRING(11),
  allowNull: true,
  unique: true,
  validate: {
    len: [11, 11],
    isNumeric: true
  }
},`);
    
    console.log('\n📝 E também atualize o formulário de registro no frontend');
    console.log('Adicione um campo de CPF ao formulário em:');
    console.log('- frontend/src/pages/Register.js');
    console.log('- frontend/src/pages/user/Profile.js (para edição)');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar campo CPF:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

adicionarCampoCpf();