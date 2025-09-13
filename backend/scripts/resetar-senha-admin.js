const { Admin } = require('../models');
const bcrypt = require('bcryptjs');

async function resetarSenhaAdmin() {
  try {
    console.log('=== RESETANDO SENHA DO SUPER ADMIN ===');
    
    // Buscar o super admin
    const superAdmin = await Admin.findOne({ 
      where: { 
        email: 'superadmin@loja.com',
        nivel: 'super'
      } 
    });
    
    if (!superAdmin) {
      console.log('❌ Super admin não encontrado');
      return;
    }
    
    // Resetar senha para 'admin123'
    const novaSenha = 'admin123';
    const senhaHash = await bcrypt.hash(novaSenha, 12);
    
    await superAdmin.update({ 
      senha: senhaHash,
      ativo: true 
    });
    
    console.log('✅ Senha do super admin resetada com sucesso!');
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Nova senha: ${novaSenha}`);
    
    // Testar a nova senha
    const senhaValida = await superAdmin.verificarSenha(novaSenha);
    console.log(`✅ Teste da nova senha: ${senhaValida ? 'SUCESSO' : 'FALHOU'}`);
    
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
  } finally {
    process.exit(0);
  }
}

resetarSenhaAdmin();