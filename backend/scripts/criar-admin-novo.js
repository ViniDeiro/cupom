const { Admin } = require('../models');

async function criarAdminNovo() {
  try {
    console.log('=== CRIANDO NOVO ADMIN PARA TESTE ===');
    
    // Deletar admin existente se houver
    await Admin.destroy({ where: { email: 'teste@admin.com' } });
    
    // Criar novo admin
    const novoAdmin = await Admin.create({
      nome: 'Admin Teste',
      email: 'teste@admin.com',
      senha: 'teste123', // O hook beforeCreate vai criptografar
      nivel: 'super',
      ativo: true
    });
    
    console.log('✅ Novo admin criado:');
    console.log(`Email: ${novoAdmin.email}`);
    console.log(`Senha: teste123`);
    console.log(`ID: ${novoAdmin.id}`);
    
    // Testar a senha imediatamente
    const senhaValida = await novoAdmin.verificarSenha('teste123');
    console.log(`✅ Teste da senha: ${senhaValida ? 'SUCESSO' : 'FALHOU'}`);
    
    if (senhaValida) {
      console.log('\n🎉 Admin criado e testado com sucesso!');
      console.log('Use as credenciais:');
      console.log('Email: teste@admin.com');
      console.log('Senha: teste123');
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    process.exit(0);
  }
}

criarAdminNovo();