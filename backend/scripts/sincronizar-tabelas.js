const { sequelize } = require('../config/database');
const { Admin, User, Product, Coupon, CouponType, SpecialDay, Order, OrderItem } = require('../models');
const bcrypt = require('bcryptjs');

async function sincronizarTabelas() {
  try {
    console.log('Sincronizando todas as tabelas...');
    
    // Forçar sincronização de todos os modelos
    await sequelize.sync({ alter: true });
    
    console.log('Tabelas sincronizadas com sucesso!');
    
    // Verificar se já existe algum super admin
    const superAdminExistente = await Admin.findOne({ where: { nivel: 'super', ativo: true } });
    if (superAdminExistente) {
      console.log('Já existe um super administrador no sistema:', superAdminExistente.email);
      return;
    }

    // Dados do super admin
    const nome = 'Super Admin';
    const email = 'superadmin@loja.com';
    const senha = 'superadmin123';
    const senhaHash = await bcrypt.hash(senha, 12);

    // Criar super admin
    const superAdmin = await Admin.create({
      nome,
      email,
      senha: senhaHash,
      nivel: 'super'
    });

    console.log('Super administrador criado com sucesso:');
    console.log('Email:', email);
    console.log('Senha:', senha);
    console.log('ID:', superAdmin.id);
  } catch (error) {
    console.error('Erro ao sincronizar tabelas:', error);
  } finally {
    process.exit(0);
  }
}

sincronizarTabelas();
