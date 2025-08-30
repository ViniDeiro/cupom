const nodemailer = require('nodemailer');

let config;
try {
  config = require('../config');
} catch (error) {
  console.error('Arquivo config.js não encontrado');
  process.exit(1);
}

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.development.email.host,
      port: config.development.email.port,
      secure: config.development.email.secure,
      auth: config.development.email.auth
    });
  }

  async enviarCupom(dadosUsuario, dadosCupom) {
    const templateCupom = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Seu Cupom de Desconto</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .cupom { background-color: #fff; border: 2px dashed #007bff; padding: 20px; margin: 20px 0; text-align: center; }
          .codigo { font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 2px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Seu Cupom de Desconto Chegou!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${dadosUsuario.nome}</strong>!</p>
            <p>Parabéns pela compra do seu cupom de desconto! Agora você pode economizar <strong>${dadosCupom.desconto_percentual}%</strong> em suas compras nos dias especiais da nossa loja.</p>
            
            <div class="cupom">
              <h2>SEU CÓDIGO DO CUPOM</h2>
              <div class="codigo">${dadosCupom.codigo}</div>
              <p><strong>Desconto:</strong> ${dadosCupom.desconto_percentual}%</p>
              <p><strong>Válido até:</strong> ${new Date(dadosCupom.data_validade).toLocaleDateString('pt-BR')}</p>
            </div>

            <h3>Como usar seu cupom:</h3>
            <ol>
              <li>Aguarde os dias especiais de desconto (você será notificado)</li>
              <li>Acesse nossa loja online</li>
              <li>Escolha seus produtos</li>
              <li>No checkout, insira o código do cupom</li>
              <li>Aproveite seu desconto!</li>
            </ol>

            <p><strong>Importante:</strong> Este cupom só pode ser usado em dias especiais de desconto. Fique atento às nossas comunicações!</p>
          </div>
          <div class="footer">
            <p>Este email foi enviado automaticamente. Não responda.</p>
            <p>© 2024 Loja Cupom - Todos os direitos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: config.development.email.auth.user,
      to: dadosUsuario.email,
      subject: `🎫 Seu Cupom ${dadosCupom.codigo} - ${dadosCupom.desconto_percentual}% de Desconto!`,
      html: templateCupom
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado:', info.messageId);
      return { sucesso: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return { sucesso: false, erro: error.message };
    }
  }

  async notificarDiaEspecial(dadosUsuario, diaEspecial) {
    const templateNotificacao = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Dia Especial Começou!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .destaque { background-color: #fff; border: 2px solid #28a745; padding: 20px; margin: 20px 0; text-align: center; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 ${diaEspecial.nome} Começou!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${dadosUsuario.nome}</strong>!</p>
            <p>Chegou a hora de usar seus cupons! O evento <strong>${diaEspecial.nome}</strong> começou!</p>
            
            <div class="destaque">
              <h2>Use Seus Cupons Agora!</h2>
              <p>${diaEspecial.descricao}</p>
              ${diaEspecial.desconto_geral ? `<p><strong>Desconto adicional:</strong> ${diaEspecial.desconto_geral}% em toda a loja!</p>` : ''}
              <p><strong>Válido até:</strong> ${new Date(diaEspecial.data_fim).toLocaleDateString('pt-BR')}</p>
            </div>

            <p><strong>Não perca tempo!</strong> Acesse nossa loja agora e aproveite seus descontos exclusivos!</p>
          </div>
          <div class="footer">
            <p>© 2024 Loja Cupom - Todos os direitos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: config.development.email.auth.user,
      to: dadosUsuario.email,
      subject: `🔥 ${diaEspecial.nome} - Use Seus Cupons Agora!`,
      html: templateNotificacao
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { sucesso: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      return { sucesso: false, erro: error.message };
    }
  }
}

module.exports = new EmailService();
