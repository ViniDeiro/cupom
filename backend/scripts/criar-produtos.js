const { sequelize } = require('../config/database');
const { Product, Admin } = require('../models');
const bcrypt = require('bcryptjs');

async function criarProdutos() {
  try {
    console.log('Sincronizando todas as tabelas...');
    await sequelize.sync({ alter: true });
    console.log('Tabelas sincronizadas com sucesso!');
    
    // Verificar se já existe um admin
    const adminExistente = await Admin.findOne();
    
    if (!adminExistente) {
      console.log('🔧 Criando administrador padrão...');
      const senhaHash = await bcrypt.hash('admin123', 12);
      await Admin.create({
        nome: 'Administrador',
        email: 'admin@loja.com',
        senha: senhaHash,
        nivel: 'super'
      });
      console.log('✅ Administrador padrão criado!');
      console.log('   Email: admin@loja.com');
      console.log('   Senha: admin123');
    }

    // Criar alguns produtos de exemplo
    const produtoExistente = await Product.findOne();
    
    if (!produtoExistente) {
      console.log('🔧 Criando produtos de exemplo...');
      
      const produtosExemplo = [
        {
          nome: 'Smartphone Premium',
          descricao: 'Smartphone com tecnologia avançada e design moderno',
          preco: 1200.00,
          preco_desconto: 999.00,
          categoria: 'Eletrônicos',
          estoque: 50,
          disponivel_dias_especiais: false
        },
        {
          nome: 'Notebook Gamer',
          descricao: 'Notebook para jogos com placa de vídeo dedicada',
          preco: 2500.00,
          preco_desconto: 2100.00,
          categoria: 'Eletrônicos',
          estoque: 25,
          disponivel_dias_especiais: false
        },
        {
          nome: 'Tênis Esportivo Exclusivo',
          descricao: 'Tênis edição limitada para colecionadores',
          preco: 800.00,
          preco_desconto: 400.00,
          categoria: 'Calçados',
          estoque: 10,
          disponivel_dias_especiais: true
        },
        {
          nome: 'Relógio Smart Premium',
          descricao: 'Smartwatch com todas as funcionalidades premium',
          preco: 1500.00,
          preco_desconto: 750.00,
          categoria: 'Acessórios',
          estoque: 15,
          disponivel_dias_especiais: true
        }
      ];

      for (const produto of produtosExemplo) {
        await Product.create(produto);
      }
      
      console.log('✅ Produtos de exemplo criados!');
    } else {
      console.log('ℹ️ Produtos já existem no banco de dados.');
    }

  } catch (error) {
    console.error('❌ Erro ao criar produtos:', error);
  } finally {
    process.exit(0);
  }
}

criarProdutos();