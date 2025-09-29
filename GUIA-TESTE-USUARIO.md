# 🧪 Guia de Teste - Fluxo Completo do Usuário

## 🎯 Objetivo
Testar o fluxo completo de um usuário: cadastro, login e compra de cupom com envio de email.

## 🚀 Pré-requisitos
- ✅ Backend rodando em: http://localhost:5000
- ✅ Frontend rodando em: http://localhost:3000
- ✅ Email configurado e testado

## 📋 Roteiro de Teste

### 1. 📱 Acessar o Site
1. Abra o navegador e acesse: **http://localhost:3000**
2. Verifique se a página inicial do "Eu Tenho Sonhos" carrega corretamente
3. Observe o design e navegação

### 2. 👤 Criar Nova Conta
1. Clique em **"Cadastrar"** ou **"Registrar"**
2. Preencha os dados:
   - **Nome**: Seu nome
   - **Email**: Use um email real (pode ser o mesmo configurado)
   - **Senha**: Crie uma senha
   - **Confirmar Senha**: Repita a senha
3. Clique em **"Cadastrar"**
4. ✅ **Esperado**: Mensagem de sucesso e redirecionamento

### 3. 🔐 Fazer Login
1. Se não foi redirecionado automaticamente, clique em **"Login"**
2. Digite:
   - **Email**: O email que você cadastrou
   - **Senha**: A senha que você criou
3. Clique em **"Entrar"**
4. ✅ **Esperado**: Login bem-sucedido e acesso à área do usuário

### 4. 🛍️ Explorar Produtos
1. Navegue pela lista de produtos disponíveis
2. Observe os preços e descrições
3. Verifique se há produtos com cupons disponíveis

### 5. 🎫 Comprar um Cupom
1. Escolha um produto que tenha cupom disponível
2. Clique em **"Comprar Cupom"** ou botão similar
3. Confirme a compra
4. ✅ **Esperado**: 
   - Mensagem de compra realizada com sucesso
   - Cupom gerado com código único
   - **EMAIL ENVIADO AUTOMATICAMENTE**

### 6. 📧 Verificar Email
1. Acesse sua caixa de email (o email que você usou no cadastro)
2. Procure por um email do "Eu Tenho Sonhos"
3. ✅ **Esperado**: 
   - Email com o código do cupom
   - Detalhes do desconto
   - Design bonito e profissional
   - Instruções de uso

### 7. 🎯 Validar Cupom (Opcional)
1. Volte ao site
2. Procure por uma área de "Validar Cupom" ou "Usar Cupom"
3. Digite o código recebido por email
4. ✅ **Esperado**: Cupom válido e desconto aplicado

## 🔍 Pontos de Atenção

### ✅ O que deve funcionar:
- [x] Cadastro de usuário
- [x] Login/logout
- [x] Listagem de produtos
- [x] Compra de cupom
- [x] Geração de código único
- [x] **Envio automático de email**
- [x] Email com design profissional

### 🚨 Possíveis problemas:
- **Email não chega**: Verifique spam/lixo eletrônico
- **Erro de autenticação**: Verifique se o login foi feito corretamente
- **Erro na compra**: Verifique console do navegador (F12)

## 📊 Dados de Teste

### 👨‍💼 Admin (para testes administrativos)
- **Email**: admin@loja.com
- **Senha**: admin123

### 🛍️ Produtos de Exemplo
O sistema já vem com produtos pré-cadastrados para teste.

## 🎉 Resultado Esperado

Ao final do teste, você deve ter:
1. ✅ Conta de usuário criada
2. ✅ Login funcionando
3. ✅ Cupom comprado com sucesso
4. ✅ **Email recebido com o código do cupom**
5. ✅ Sistema completo funcionando

---

**🎯 Foco Principal**: O envio automático de email após a compra do cupom!

**📧 Email configurado**: eutenhosonhos5@gmail.com
**🔑 Autenticação**: App Password configurada
**✅ Status**: Sistema 100% operacional

---

*Qualquer problema durante o teste, verifique os logs do backend no terminal.*