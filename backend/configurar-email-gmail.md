# 📧 Configuração de Email Gmail para o Sistema de Cupons

## ⚠️ Problema Atual
O Gmail **não aceita mais senhas normais** para aplicações externas por questões de segurança. É necessário usar uma **Senha de App**.

## 🔐 Como Configurar Senha de App no Gmail

### Passo 1: Ativar Verificação em 2 Etapas
1. Acesse: https://myaccount.google.com/security
2. Na seção "Como fazer login no Google", clique em "Verificação em duas etapas"
3. Siga as instruções para ativar (será necessário seu telefone)

### Passo 2: Gerar Senha de App
1. Após ativar a verificação em 2 etapas, acesse: https://myaccount.google.com/apppasswords
2. Selecione "Email" como aplicativo
3. Selecione "Outro (nome personalizado)" como dispositivo
4. Digite: "Sistema de Cupons"
5. Clique em "Gerar"
6. **Copie a senha de 16 caracteres gerada** (exemplo: `abcd efgh ijkl mnop`)

### Passo 3: Atualizar config.js
Substitua a senha no arquivo `backend/config.js`:

```javascript
email: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'eutenhosonhos5@gmail.com',
    pass: 'abcd efgh ijkl mnop'  // ← Cole aqui a senha de app gerada
  }
}
```

### Passo 4: Testar
```bash
cd backend
node test-email.js
```

## 🔍 Verificações

### ✅ Checklist de Configuração
- [ ] Verificação em 2 etapas ativada
- [ ] Senha de app gerada
- [ ] Senha de app copiada para config.js
- [ ] Servidor reiniciado
- [ ] Teste executado

### 🚨 Problemas Comuns

**Erro: "Username and Password not accepted"**
- ✅ Certifique-se de usar a senha de app, não a senha normal
- ✅ Verifique se a verificação em 2 etapas está ativa
- ✅ Confirme se o email está correto

**Erro: "Less secure app access"**
- ✅ Use senha de app (mais seguro que "acesso a apps menos seguros")

## 📱 Alternativas

Se preferir, pode usar outros provedores:

### Outlook/Hotmail
```javascript
email: {
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: 'seu_email@outlook.com',
    pass: 'sua_senha_normal'  // Outlook aceita senha normal
  }
}
```

### SendGrid (Recomendado para produção)
```javascript
email: {
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: 'SG.sua_api_key_aqui'
  }
}
```

## 🎯 Próximos Passos

1. **Configure a senha de app** seguindo os passos acima
2. **Teste o envio** com `node test-email.js`
3. **Reinicie o servidor** para aplicar as mudanças
4. **Teste no sistema** comprando um cupom

---

💡 **Dica**: Guarde a senha de app em local seguro, pois ela não será exibida novamente no Google.