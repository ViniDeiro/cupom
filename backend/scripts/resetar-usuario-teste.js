const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function resetarUsuarioTeste() {
  try {
    console.log('=== RESETANDO USUÁRIO TESTE ===');
    
    // Buscar o usuário
    const usuario = await User.findOne({ 
      where: { email: 'teste@teste.com' } 
    });
    
    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    // Resetar senha para 'teste123'
    const novaSenha = 'teste123';
    const senhaHash = await bcrypt.hash(novaSenha, 12);
    
    await usuario.update({ 
      senha: senhaHash,
      ativo: true 
    });
    
    console.log('✅ Senha do usuário resetada com sucesso!');
    console.log(`Email: ${usuario.email}`);
    console.log(`Nova senha: ${novaSenha}`);
    
    // Testar a nova senha
    const senhaValida = await usuario.verificarSenha(novaSenha);
    console.log(`✅ Teste da nova senha: ${senhaValida ? 'SUCESSO' : 'FALHOU'}`);
    
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
  } finally {
    process.exit(0);
  }
}

resetarUsuarioTeste();