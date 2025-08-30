const emailService = require('./services/emailService');

// Dados simulados para teste
const dadosUsuario = {
  nome: 'Vinícius',
  email: 'vini_deiro@icloud.com'
};

const dadosCupom = {
  codigo: 'CUPTESTE123',
  desconto_percentual: 30,
  data_validade: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 dias a partir de hoje
};

async function testarEnvioEmail() {
  console.log('🧪 Iniciando teste de envio de email...');
  console.log(`📧 Destinatário: ${dadosUsuario.email}`);
  console.log(`🎫 Cupom: ${dadosCupom.codigo} - ${dadosCupom.desconto_percentual}% desconto`);
  console.log('\n⚙️ Status das configurações:');
  
  // Verificar configurações
  let config;
  try {
    config = require('./config');
    console.log('✅ Arquivo config.js encontrado');
    
    if (config.development.email.auth.user === 'seu_email@gmail.com') {
      console.log('⚠️  Configurações de email não foram personalizadas');
      console.log('\n📋 Para ativar o envio de emails, você precisa:');
      console.log('\n1. 📧 Configurar um email Gmail no config.js:');
      console.log('   email: {');
      console.log('     host: "smtp.gmail.com",');
      console.log('     port: 587,');
      console.log('     secure: false,');
      console.log('     auth: {');
      console.log('       user: "seu_email@gmail.com",  // ← Substitua pelo seu email');
      console.log('       pass: "sua_senha_app"          // ← Senha de app do Gmail');
      console.log('     }');
      console.log('   }');
      console.log('\n2. 🔐 Gerar senha de app no Gmail:');
      console.log('   • Acesse: https://myaccount.google.com/apppasswords');
      console.log('   • Ative a verificação em 2 etapas');
      console.log('   • Gere uma senha de app para "Email"');
      console.log('   • Use essa senha no campo "pass" do config.js');
      console.log('\n3. 🔄 Reinicie o servidor após as configurações');
      
      console.log('\n🎯 Simulação do email que seria enviado:');
      console.log('═'.repeat(60));
      console.log(`Para: ${dadosUsuario.email}`);
      console.log(`Assunto: 🎫 Seu Cupom ${dadosCupom.codigo} - ${dadosCupom.desconto_percentual}% de Desconto!`);
      console.log('\nConteúdo:');
      console.log(`🎉 Olá ${dadosUsuario.nome}!`);
      console.log(`Seu cupom de ${dadosCupom.desconto_percentual}% de desconto está pronto!`);
      console.log(`Código: ${dadosCupom.codigo}`);
      console.log(`Válido até: ${dadosCupom.data_validade.toLocaleDateString('pt-BR')}`);
      console.log('\n⚠️ Importante: Use apenas em dias especiais!');
      console.log('═'.repeat(60));
      
      return;
    }
    
    // Se chegou aqui, as configurações foram personalizadas
    console.log('✅ Configurações de email personalizadas encontradas');
    console.log('🚀 Tentando enviar email real...');
    
    const resultado = await emailService.enviarCupom(dadosUsuario, dadosCupom);
    
    if (resultado.sucesso) {
      console.log('\n🎉 EMAIL ENVIADO COM SUCESSO!');
      console.log(`📨 Message ID: ${resultado.messageId}`);
      console.log(`📧 Enviado para: ${dadosUsuario.email}`);
      console.log(`🎫 Cupom: ${dadosCupom.codigo}`);
      console.log(`💰 Desconto: ${dadosCupom.desconto_percentual}%`);
      console.log(`📅 Válido até: ${dadosCupom.data_validade.toLocaleDateString('pt-BR')}`);
      console.log('\n✉️ Verifique sua caixa de entrada!');
    } else {
      console.log('\n❌ Falha ao enviar email:');
      console.log(`Erro: ${resultado.erro}`);
      console.log('\n🔧 Possíveis soluções:');
      console.log('• Verificar se o email e senha estão corretos');
      console.log('• Confirmar que a senha de app foi gerada');
      console.log('• Verificar conexão com internet');
      console.log('• Tentar com outro provedor de email');
    }
    
  } catch (error) {
    console.log('❌ Erro ao carregar configurações:', error.message);
  }
}

// Executar teste
testarEnvioEmail();