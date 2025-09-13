const { User } = require('../models');

async function criarUsuarioNovo() {
  try {
    console.log('=== CRIANDO NOVO USUÁRIO PARA TESTE ===');
    
    // Deletar usuário existente se houver
    await User.destroy({ where: { email: 'novo@teste.com' } });
    
    // Criar novo usuário
    const novoUsuario = await User.create({
      nome: 'Usuário Novo',
      email: 'novo@teste.com',
      cpf: '11122233344',
      senha: 'novo123', // O hook beforeCreate vai criptografar
      ativo: true
    });
    
    console.log('✅ Novo usuário criado:');
    console.log(`Email: ${novoUsuario.email}`);
    console.log(`Senha: novo123`);
    console.log(`ID: ${novoUsuario.id}`);
    
    // Testar a senha imediatamente
    const senhaValida = await novoUsuario.verificarSenha('novo123');
    console.log(`✅ Teste da senha: ${senhaValida ? 'SUCESSO' : 'FALHOU'}`);
    
    if (senhaValida) {
      console.log('\n🎉 Usuário criado e testado com sucesso!');
      console.log('Use as credenciais:');
      console.log('Email: novo@teste.com');
      console.log('Senha: novo123');
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    process.exit(0);
  }
}

criarUsuarioNovo();