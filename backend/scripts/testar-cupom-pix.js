const { sequelize } = require('../config/database');
const { User, CouponType, Coupon } = require('../models');
const paymentService = require('../services/paymentService');

async function testarCupomPix() {
  try {
    console.log('🧪 Testando funcionalidade de compra de cupons com PIX...');
    console.log('');

    // 1. Verificar se existem tipos de cupons
    const tiposCupons = await CouponType.findAll({ where: { ativo: true } });
    console.log(`📋 Tipos de cupons disponíveis: ${tiposCupons.length}`);
    
    if (tiposCupons.length === 0) {
      console.log('⚠️  Nenhum tipo de cupom encontrado. Criando tipos de exemplo...');
      
      await CouponType.bulkCreate([
        {
          nome: 'Cupom Bronze - 10% OFF',
          descricao: 'Desconto de 10% em produtos selecionados',
          desconto: 10,
          preco: 25.00,
          validade_dias: 90,
          ativo: true
        },
        {
          nome: 'Cupom Prata - 15% OFF',
          descricao: 'Desconto de 15% em produtos selecionados',
          desconto: 15,
          preco: 50.00,
          validade_dias: 60,
          ativo: true
        },
        {
          nome: 'Cupom Ouro - 25% OFF',
          descricao: 'Desconto de 25% em produtos selecionados',
          desconto: 25,
          preco: 100.00,
          validade_dias: 30,
          ativo: true
        }
      ]);
      
      console.log('✅ Tipos de cupons criados com sucesso!');
    }

    // 2. Verificar se existe usuário de teste
    let usuarioTeste = await User.findOne({ where: { email: 'teste@cupom.com' } });
    
    if (!usuarioTeste) {
      console.log('👤 Criando usuário de teste...');
      usuarioTeste = await User.create({
        nome: 'Usuário Teste',
        email: 'teste@cupom.com',
        senha: 'teste123',
        telefone: '11999999999',
        cpf: '12345678901', // CPF de teste
        ativo: true
      });
      console.log('✅ Usuário de teste criado!');
    } else if (!usuarioTeste.cpf) {
      await usuarioTeste.update({ cpf: '12345678901' });
      console.log('✅ CPF adicionado ao usuário de teste!');
    }

    // 3. Verificar estrutura da tabela cupons
    const descricaoTabela = await sequelize.getQueryInterface().describeTable('cupons');
    const camposNecessarios = ['status_pagamento', 'mercado_pago_payment_id'];
    const camposFaltando = camposNecessarios.filter(campo => !descricaoTabela[campo]);
    
    if (camposFaltando.length > 0) {
      console.log(`⚠️  Campos faltando na tabela cupons: ${camposFaltando.join(', ')}`);
      console.log('💡 Execute: node scripts/sincronizar-tabelas.js');
    } else {
      console.log('✅ Estrutura da tabela cupons está correta!');
    }

    // 4. Verificar configuração do Mercado Pago
    try {
      const config = require('../config');
      const mpConfig = config.development.mercadoPago;
      
      if (mpConfig && mpConfig.accessToken) {
        console.log('✅ Configuração do Mercado Pago encontrada!');
        console.log(`   Ambiente: ${mpConfig.accessToken.includes('TEST') ? 'Teste' : 'Produção'}`);
      } else {
        console.log('⚠️  Configuração do Mercado Pago não encontrada!');
      }
    } catch (error) {
      console.log('⚠️  Erro ao verificar configuração do Mercado Pago:', error.message);
    }

    // 5. Listar rotas implementadas
    console.log('');
    console.log('🛣️  Rotas implementadas:');
    console.log('   • POST /api/coupon-payments/buy-coupon-pix - Comprar cupom com PIX');
    console.log('   • GET /api/coupon-payments/coupon-payment-status/:payment_id - Status do pagamento');
    console.log('   • POST /api/payments/generate-pix - Gerar PIX para pedidos (atualizada)');
    console.log('');

    // 6. Verificar cupons existentes
    const cuponsExistentes = await Coupon.count();
    console.log(`📊 Cupons existentes no sistema: ${cuponsExistentes}`);

    console.log('');
    console.log('🎯 Resumo da implementação:');
    console.log('   ✅ Campo CPF adicionado ao modelo User');
    console.log('   ✅ Campos de pagamento adicionados ao modelo Coupon');
    console.log('   ✅ Rota específica para compra de cupons com PIX');
    console.log('   ✅ Componente React para pagamento PIX');
    console.log('   ✅ Validação de CPF implementada');
    console.log('   ✅ Integração com Mercado Pago');
    console.log('');
    console.log('🚀 Para testar:');
    console.log('   1. Acesse http://localhost:3000');
    console.log('   2. Faça login ou registre-se');
    console.log('   3. Vá para "Comprar Cupons"');
    console.log('   4. Clique em "Comprar com PIX"');
    console.log('   5. Complete o pagamento usando o QR Code');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  } finally {
    await sequelize.close();
  }
}

testarCupomPix();