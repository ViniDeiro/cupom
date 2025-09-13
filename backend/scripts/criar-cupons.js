const { sequelize } = require('../config/database');
const { CouponType } = require('../models');

async function criarTiposCupons() {
  try {
    console.log('Sincronizando tabelas...');
    await sequelize.sync({ alter: true });
    console.log('Tabelas sincronizadas com sucesso!');
    
    // Verificar se já existem tipos de cupons
    const tiposExistentes = await CouponType.findAll();
    
    if (tiposExistentes.length === 0) {
      console.log('🔧 Criando tipos de cupons de exemplo...');
      
      const tiposPadrao = [
        {
          nome: 'Cupom Bronze',
          desconto: 10,
          preco: 15.00,
          descricao: 'Desconto de 10% em produtos selecionados',
          validade_dias: 90,
          ativo: true
        },
        {
          nome: 'Cupom Prata',
          desconto: 20,
          preco: 25.00,
          descricao: 'Desconto de 20% em produtos selecionados',
          validade_dias: 90,
          ativo: true
        },
        {
          nome: 'Cupom Ouro',
          desconto: 30,
          preco: 65.00,
          descricao: 'Desconto de 30% em produtos selecionados',
          validade_dias: 90,
          ativo: true
        },
        {
          nome: 'Cupom Diamante',
          desconto: 50,
          preco: 100.00,
          descricao: 'Desconto de 50% em produtos selecionados',
          validade_dias: 90,
          ativo: true
        }
      ];
      
      await CouponType.bulkCreate(tiposPadrao);
      
      console.log('✅ Tipos de cupons criados com sucesso!');
      console.log(`   - ${tiposPadrao.length} tipos de cupons adicionados`);
    } else {
      console.log('ℹ️ Tipos de cupons já existem no banco de dados.');
      console.log(`   - ${tiposExistentes.length} tipos encontrados`);
    }

  } catch (error) {
    console.error('❌ Erro ao criar tipos de cupons:', error);
  } finally {
    process.exit(0);
  }
}

criarTiposCupons();