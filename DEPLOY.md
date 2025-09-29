# 🚀 Deploy da Loja de Cupons - TUDO NA VERCEL

## 📋 Pré-requisitos

1. **Conta no Vercel**: [vercel.com](https://vercel.com)
2. **Conta no GitHub**: [github.com](https://github.com)
3. **Banco de dados PostgreSQL**: Vercel Postgres ou [Neon](https://neon.tech)
4. **Código no GitHub**: Faça push do projeto para um repositório

## 🎯 Estratégia de Deploy

- **Frontend + Backend**: Vercel (Monorepo)
- **Banco**: Vercel Postgres ou Neon PostgreSQL
- **Funções**: Vercel Serverless Functions

## 🔧 Passo a Passo

### 1️⃣ **Configurar Banco de Dados**

**Opção A: Vercel Postgres (Recomendado)**
1. No dashboard da Vercel, vá em "Storage"
2. Clique em "Create Database" → "Postgres"
3. Escolha um nome para o banco
4. Anote as credenciais geradas

**Opção B: Neon (Gratuito)**
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta e um novo projeto
3. Copie a connection string

### 2️⃣ **Deploy na Vercel (Tudo junto!)**

1. **Importar projeto**:
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Import Project"
   - Conecte GitHub e selecione o repositório
   - **IMPORTANTE**: Configure o diretório raiz como `/` (raiz do projeto)

2. **Configurar variáveis de ambiente**:
   ```env
   NODE_ENV=production
   
   # Banco de dados
   POSTGRES_HOST=seu-host-postgres
   POSTGRES_PORT=5432
   POSTGRES_DATABASE=seu-database
   POSTGRES_USER=seu-usuario
   POSTGRES_PASSWORD=sua-senha
   
   # JWT
   JWT_SECRET=sua_chave_jwt_super_segura
   
   # Email
   EMAIL_USER=eutenhosonhos5@gmail.com
   EMAIL_PASS=sua_app_password_gmail
   
   # Mercado Pago
   MERCADO_PAGO_ACCESS_TOKEN=seu_access_token
   MERCADO_PAGO_PUBLIC_KEY=sua_public_key
   
   # URLs (serão geradas automaticamente)
   FRONTEND_URL=https://seu-projeto.vercel.app
   BACKEND_URL=https://seu-projeto.vercel.app
   
   # React (Frontend)
   REACT_APP_API_URL=https://seu-projeto.vercel.app
   REACT_APP_MERCADO_PAGO_PUBLIC_KEY=sua_public_key
   ```

3. **Deploy**:
   - Clique em "Deploy"
   - Aguarde a conclusão (3-5 minutos)

### 3️⃣ **Configurações Finais**

1. **Aguardar deploy completo**
   - Frontend e backend estarão na mesma URL
   - API estará em: `https://seu-projeto.vercel.app/api`

2. **Testar endpoints**
   - Acesse: `https://seu-projeto.vercel.app/api/health`
   - Deve retornar: `{"status": "ok"}`

## 🌐 URLs Finais

Após o deploy, você terá **TUDO EM UMA URL**:

- **Loja**: `https://seu-projeto.vercel.app`
- **API**: `https://seu-projeto.vercel.app/api`
- **Health Check**: `https://seu-projeto.vercel.app/api/health`

## 🔧 Solução de Problemas

### ❌ Erro de conexão com banco
- Verifique se as variáveis `POSTGRES_*` estão corretas
- Confirme se o banco PostgreSQL está acessível

### ❌ Erro 500 nas funções
- Verifique os logs na Vercel (Functions tab)
- Confirme se todas as variáveis de ambiente estão definidas
- Teste localmente primeiro

### ❌ Erro de build
- Verifique se o `vercel.json` está na raiz do projeto
- Confirme se as pastas `frontend` e `backend` existem
- Verifique se `api/index.js` foi criado

### ❌ Banco não conecta
- **Vercel Postgres**: Verifique se as credenciais estão corretas
- **Neon**: Confirme se a connection string está completa
- Teste a conexão localmente primeiro

## 📧 Configuração de Email

Para o envio de emails funcionar:

1. **Ativar verificação em 2 etapas** no Gmail
2. **Gerar App Password**:
   - Acesse: Conta Google → Segurança → Verificação em duas etapas
   - Vá em "Senhas de app"
   - Selecione "Email" e "Sistema Cupons"
   - Copie a senha de 16 caracteres
   - Use essa senha na variável `EMAIL_PASS`

## 🎯 Vantagens do Deploy na Vercel

✅ **Tudo em uma plataforma**
✅ **Deploy automático** a cada push
✅ **SSL gratuito** e automático
✅ **CDN global** para performance
✅ **Logs integrados** para debug
✅ **Domínio personalizado** gratuito

---

## 🚀 **Sua loja está no ar!**

Acesse sua loja em: `https://seu-projeto.vercel.app`

**Próximos passos:**
1. Testar compra de cupons
2. Verificar envio de emails
3. Testar pagamentos Mercado Pago
4. Configurar domínio personalizado (opcional)