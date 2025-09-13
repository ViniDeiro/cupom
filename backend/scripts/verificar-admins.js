const { Admin } = require('../models');
const bcrypt = require('bcryptjs');

async function verificarAdmins() {
  try {
    console.log('=== VERIFICANDO ADMINISTRADORES ===');
    
    const admins = await Admin.findAll();
    console.log(`Total de admins encontrados: ${admins.length}`);
    
    for (const admin of admins) {
      console.log(`\nID: ${admin.id}`);
      console.log(`Nome: ${admin.nome}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Nível: ${admin.nivel}`);
      console.log(`Ativo: ${admin.ativo}`);
      
      // Testar senhas comuns
      const senhasParaTestar = ['admin123', 'superadmin123', '123456'];
      
      for (const senha of senhasParaTestar) {
        const senhaValida = await admin.verificarSenha(senha);
        if (senhaValida) {
          console.log(`✅ Senha correta: ${senha}`);
          break;
        }
      }
    }
    
    // Se não encontrou nenhum admin ativo, criar um novo
    const adminAtivo = await Admin.findOne({ where: { ativo: true } });
    if (!adminAtivo) {
      console.log('\n=== CRIANDO NOVO ADMIN ===');
      const novoAdmin = await Admin.create({
        nome: 'Admin Sistema',
        email: 'admin@sistema.com',
        senha: 'admin123',
        nivel: 'super'
      });
      console.log(`✅ Admin criado: ${novoAdmin.email} / admin123`);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit(0);
  }
}

verificarAdmins();