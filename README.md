# 🎫 Loja Cupom - Sistema de Cupons Especiais

Um sistema completo de e-commerce com funcionalidade única de cupons especiais. Os usuários podem comprar cupons antecipadamente e utilizá-los apenas em dias especiais pré-determinados pelo administrador.

## 🚀 Características Principais

### Para Usuários:
- **Compra de Cupons**: Adquira cupons de desconto (10% a 50%) com validade de 90 dias
- **Dias Especiais**: Use cupons apenas em dias especiais ativados pelo admin
- **Notificações por Email**: Receba avisos quando os dias especiais começarem
- **Produtos Exclusivos**: Acesso a produtos disponíveis apenas em dias especiais
- **Sistema de Carrinho**: Carrinho completo com aplicação de cupons
- **Histórico de Pedidos**: Acompanhe todos os seus pedidos

### Para Administradores:
- **Gestão de Produtos**: CRUD completo de produtos com categorias
- **Gestão de Dias Especiais**: Criar e ativar períodos de desconto
- **Gestão de Pedidos**: Acompanhar e atualizar status dos pedidos
- **Dashboard Administrativo**: Estatísticas completas de vendas
- **Relatórios**: Relatórios detalhados de cupons e vendas
- **Notificações em Massa**: Envio automático de emails para usuários

## 🛠️ Tecnologias Utilizadas

### Backend:
- **Node.js** + **Express.js**
- **PostgreSQL** com **Sequelize ORM**
- **JWT** para autenticação
- **Bcrypt** para criptografia de senhas
- **Nodemailer** para envio de emails
- **Express Validator** para validação de dados

### Frontend:
- **React 18** com **React Router**
- **React Query** para gerenciamento de estado servidor
- **React Hook Form** para formulários
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **React Hot Toast** para notificações

## 📋 Pré-requisitos

- Node.js 16+ 
- PostgreSQL 12+
- NPM ou Yarn

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd cupom
```

### 2. Configure o Backend

```bash
cd backend
npm install
```

#### Configuração do Banco de Dados
1. Crie um banco PostgreSQL chamado `cupom_store`
2. Copie o arquivo de configuração:
```bash
cp config.example.js config.js
```
3. Edite `config.js` com suas configurações:
```javascript
module.exports = {
  development: {
    port: 5000,
    database: {
      host: 'localhost',
      port: 5432,
      database: 'cupom_store',
      username: 'seu_usuario_postgres',
      password: 'sua_senha_postgres',
      dialect: 'postgres',
      logging: false
    },
    jwt: {
      secret: 'sua_chave_secreta_super_segura_aqui',
      expiresIn: '7d'
    },
    email: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'seu_email@gmail.com',
        pass: 'sua_senha_de_app'  // Use senha de app do Gmail
      }
    },
    admin: {
      email: 'admin@loja.com',
      password: 'admin123'
    }
  }
};
```

### 3. Configure o Frontend

```bash
cd ../frontend
npm install
```

### 4. Configure o Tailwind CSS

O projeto já vem com Tailwind configurado. Instale as dependências adicionais:

```bash
npm install @tailwindcss/forms @tailwindcss/typography
```

## 🚀 Executando o Projeto

### Opção 1: Executar tudo junto (recomendado)
```bash
# Na raiz do projeto
npm install
npm run dev
```

### Opção 2: Executar separadamente

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## 🌐 Acessos

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:5000
- **Admin**: http://localhost:3000/admin/login

### Credenciais de Administrador Padrão:
- **Email**: admin@loja.com
- **Senha**: admin123

## 📚 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/admin/login` - Login administrativo

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Obter produto específico
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `DELETE /api/products/:id` - Deletar produto (admin)

### Cupons
- `GET /api/coupons/tipos` - Tipos de cupons disponíveis
- `POST /api/coupons/comprar` - Comprar cupom
- `GET /api/coupons/meus-cupons` - Cupons do usuário
- `POST /api/coupons/validar` - Validar cupom
- `GET /api/coupons/dia-especial` - Verificar dia especial

### Pedidos
- `POST /api/orders` - Criar pedido
- `GET /api/orders/meus-pedidos` - Pedidos do usuário
- `GET /api/orders/:id` - Obter pedido específico

### Administração
- `GET /api/admin/dashboard` - Dashboard administrativo
- `GET /api/admin/dias-especiais` - Listar dias especiais
- `POST /api/admin/dias-especiais` - Criar dia especial
- `POST /api/admin/dias-especiais/:id/ativar` - Ativar dia especial

## 💾 Estrutura do Banco de Dados

### Principais Tabelas:
- **usuarios** - Dados dos usuários
- **administradores** - Dados dos administradores
- **produtos** - Catálogo de produtos
- **cupons** - Cupons de desconto dos usuários
- **dias_especiais** - Períodos de desconto especiais
- **pedidos** - Pedidos realizados
- **itens_pedido** - Itens de cada pedido

## 🎯 Fluxo de Uso

### Para Usuários:
1. **Cadastro**: Criar conta gratuita
2. **Comprar Cupons**: Escolher tipo de cupom e realizar pagamento
3. **Aguardar Dias Especiais**: Receber notificação por email
4. **Usar Cupons**: Aplicar cupons durante checkout nos dias especiais
5. **Acompanhar Pedidos**: Ver status e histórico

### Para Administradores:
1. **Login Admin**: Acessar painel administrativo
2. **Gerenciar Produtos**: Cadastrar produtos e categorias
3. **Criar Dias Especiais**: Definir períodos de desconto
4. **Ativar Eventos**: Ativar dias especiais e notificar usuários
5. **Acompanhar Vendas**: Ver relatórios e estatísticas

## 🎨 Funcionalidades de Design

- **Design Responsivo**: Funciona perfeitamente em mobile e desktop
- **Modo Escuro**: Interface moderna com gradientes
- **Animações**: Transições suaves e micro-interações
- **Loading States**: Feedback visual durante carregamentos
- **Toast Notifications**: Notificações elegantes para ações

## 📧 Configuração de Email

Para o envio de emails funcionar corretamente:

1. **Gmail**: Use uma senha de app, não sua senha normal
2. **Outros provedores**: Configure SMTP adequadamente
3. **Teste**: Verifique se os emails estão sendo enviados

### Exemplo de configuração Gmail:
1. Ative a verificação em 2 etapas
2. Gere uma senha de app
3. Use essa senha no arquivo de configuração

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Validação rigorosa de dados
- Proteção contra ataques comuns
- Headers de segurança com Helmet

## 🚀 Deploy

### Backend (exemplo com Heroku):
1. Configure variáveis de ambiente
2. Configure banco PostgreSQL
3. Deploy via Git

### Frontend (exemplo com Netlify):
1. Build do projeto: `npm run build`
2. Deploy da pasta `build`
3. Configure redirecionamentos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema:

1. Verifique se todas as dependências estão instaladas
2. Confirme se o banco PostgreSQL está rodando
3. Verifique as configurações no arquivo `config.js`
4. Abra uma issue no GitHub

## 📈 Próximas Funcionalidades

- [ ] Pagamento real (PIX, cartão)
- [ ] Sistema de reviews/avaliações
- [ ] Programa de fidelidade
- [ ] App mobile
- [ ] Integração com redes sociais
- [ ] Sistema de chat/suporte

---

**Desenvolvido com ❤️ usando as melhores práticas de desenvolvimento**
