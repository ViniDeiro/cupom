const { sequelize } = require('../config/database');
const { Coupon } = require('../models');

async function atualizarModeloCupom() {
  try {
    console.log('Atualizando modelo de cupom para suportar pagamentos PIX...');

    // Adicionar campos necessários para pagamentos PIX
    await sequelize.getQueryInterface().addColumn('cupons', 'status_pagamento', {
      type: sequelize.Sequelize.ENUM('pendente', 'aprovado', 'rejeitado'),
      allowNull: true,
      defaultValue: 'pendente'
    });

    await sequelize.getQueryInterface().addColumn('cupons', 'mercado_pago_payment_id', {
      type: sequelize.Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    console.log('✅ Campos adicionados com sucesso:');
    console.log('   - status_pagamento (ENUM: pendente, aprovado, rejeitado)');
    console.log('   - mercado_pago_payment_id (STRING, unique)');
    console.log('');
    console.log('📝 Próximos passos:');
    console.log('   1. Atualizar o modelo Coupon.js para incluir os novos campos');
    console.log('   2. Testar a compra de cupons com PIX no frontend');
    console.log('   3. Verificar se o webhook do Mercado Pago está funcionando');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Campos já existem na tabela cupons');
    } else {
      console.error('❌ Erro ao atualizar modelo de cupom:', error.message);
    }
  } finally {
    await sequelize.close();
  }
}

atualizarModeloCupom();