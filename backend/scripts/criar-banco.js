const { sequelize } = require('../config/database');
const { Admin, User, Product, Coupon, CouponType, SpecialDay, Order, OrderItem } = require('../models');
const bcrypt = require('bcryptjs');

async function criarBanco() {
  try {
    console.log('🔧 Criando banco de dados e tabelas...');
    
    // Forçar criação de todas as tabelas
    await sequelize.sync({ force: true });
    
    console.log('✅ Banco de dados e tabelas criados com sucesso!');
    
    // Criar super admin
    const nome = 'Super Admin';
    const email = 'superadmin@loja.com';
    const senha = 'superadmin123';
    const senhaHash = await bcrypt.hash(senha, 12);

    const superAdmin = await Admin.create({
      nome,
      email,
      senha: senhaHash,
      nivel: 'super'
    });

    console.log('✅ Super administrador criado:');
    console.log('Email:', email);
    console.log('Senha:', senha);
    console.log('ID:', superAdmin.id);
    
    // Criar tipos de cupons
    const tiposCupons = [
      {
        nome: 'Desconto Básico',
        descricao: 'Cupom de desconto básico para compras',
        desconto: 10,
        preco: 5.00,
        validade_dias: 30
      },
      {
        nome: 'Desconto Premium',
        descricao: 'Cupom de desconto premium com maior valor',
        desconto: 20,
        preco: 10.00,
        validade_dias: 60
      },
      {
        nome: 'Desconto VIP',
        descricao: 'Cupom de desconto VIP para clientes especiais',
        desconto: 30,
        preco: 15.00,
        validade_dias: 90
      },
      {
        nome: 'Desconto Black Friday',
        descricao: 'Cupom especial para Black Friday',
        desconto: 50,
        preco: 25.00,
        validade_dias: 7
      }
    ];

    await CouponType.bulkCreate(tiposCupons);
    console.log('✅ Tipos de cupons criados:', tiposCupons.length);
    
    // Criar produtos de exemplo
    const produtos = [
      {
        nome: 'Smartphone Galaxy',
        descricao: 'Smartphone Samsung Galaxy com 128GB',
        preco: 899.99,
        categoria: 'Eletrônicos',
        estoque: 50,
        ativo: true
      },
      {
        nome: 'Notebook Dell',
        descricao: 'Notebook Dell Inspiron 15 com 8GB RAM',
        preco: 2499.99,
        categoria: 'Informática',
        estoque: 25,
        ativo: true
      },
      {
        nome: 'Fone Bluetooth',
        descricao: 'Fone de ouvido Bluetooth com cancelamento de ruído',
        preco: 199.99,
        categoria: 'Acessórios',
        estoque: 100,
        ativo: true
      }
    ];

    await Product.bulkCreate(produtos);
    console.log('✅ Produtos criados:', produtos.length);
    
  } catch (error) {
    console.error('❌ Erro ao criar banco:', error);
  } finally {
    process.exit(0);
  }
}

criarBanco();
