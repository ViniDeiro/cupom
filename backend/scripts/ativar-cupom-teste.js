const { Coupon } = require('../models');
const { sequelize } = require('../config/database');

async function ativarCupomTeste() {
  try {
    console.log('🔧 Ativando cupom de teste...');
    
    // Buscar o cupom mais recente do usuário de teste
    const cupom = await Coupon.findOne({
      where: {
        codigo: 'CUPQT2HPF8U' // Código do cupom criado no teste
      }
    });
    
    if (!cupom) {
      console.log('❌ Cupom não encontrado!');
      return;
    }
    
    console.log('📋 Cupom encontrado:');
    console.log(`Código: ${cupom.codigo}`);
    console.log(`Ativo: ${cupom.ativo}`);
    console.log(`Status: ${cupom.status_pagamento}`);
    
    // Ativar o cupom (simular aprovação do PIX)
    await cupom.update({
      ativo: true,
      status_pagamento: 'aprovado'
    });
    
    console.log('✅ Cupom ativado com sucesso!');
    console.log('🎉 Agora o cupom deve aparecer como válido em "Meus Cupons"!');
    
  } catch (error) {
    console.error('❌ Erro ao ativar cupom:', error);
  } finally {
    await sequelize.close();
  }
}

ativarCupomTeste();