const { Admin } = require('../models');
const bcrypt = require('bcryptjs');

async function criarSuperAdmin() {
  try {
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
    console.error('Erro ao criar super administrador:', error);
  } finally {
    process.exit(0);
  }
}

criarSuperAdmin();