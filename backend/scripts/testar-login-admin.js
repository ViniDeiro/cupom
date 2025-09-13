const axios = require('axios');
const bcrypt = require('bcryptjs');
const { Admin } = require('../models');

async function testarLoginAdmin() {
  try {
    console.log('Verificando super administrador no banco de dados...');
    
    // Verificar se o super admin existe
    const superAdmin = await Admin.findOne({ where: { email: 'superadmin@loja.com', nivel: 'super' } });
    
    if (!superAdmin) {
      console.log('Super administrador não encontrado no banco de dados!');
      return;
    }
    
    console.log('Super administrador encontrado:');
    console.log('ID:', superAdmin.id);
    console.log('Nome:', superAdmin.nome);
    console.log('Email:', superAdmin.email);
    console.log('Nível:', superAdmin.nivel);
    
    // Testar verificação de senha
    const senhaCorreta = await superAdmin.verificarSenha('superadmin123');
    console.log('Verificação de senha:', senhaCorreta ? 'SUCESSO' : 'FALHA');
    
    // Tentar fazer login via API
    console.log('\nTentando login via API...');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
        email: 'superadmin@loja.com',
        senha: 'superadmin123'
      });
      
      console.log('Login via API: SUCESSO');
      console.log('Token:', response.data.token);
      console.log('Admin:', response.data.admin);
    } catch (error) {
      console.log('Login via API: FALHA');
      console.log('Erro:', error.response ? error.response.data : error.message);
      
      // Se falhou, verificar se a senha está corretamente armazenada
      console.log('\nVerificando hash da senha...');
      console.log('Hash atual:', superAdmin.senha);
      
      // Atualizar a senha para garantir que está correta
      const senhaHash = await bcrypt.hash('superadmin123', 12);
      await superAdmin.update({ senha: senhaHash });
      console.log('Senha atualizada com novo hash:', senhaHash);
      
      // Tentar login novamente
      console.log('\nTentando login novamente após atualização da senha...');
      try {
        const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
          email: 'superadmin@loja.com',
          senha: 'superadmin123'
        });
        
        console.log('Login via API após atualização: SUCESSO');
        console.log('Token:', response.data.token);
        console.log('Admin:', response.data.admin);
      } catch (error) {
        console.log('Login via API após atualização: FALHA');
        console.log('Erro:', error.response ? error.response.data : error.message);
      }
    }
  } catch (error) {
    console.error('Erro ao testar login:', error);
  } finally {
    process.exit(0);
  }
}

testarLoginAdmin();