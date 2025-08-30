const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');
const config = require('../config');

// Inicializar cliente do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: config.mercadoPago?.accessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const payment = new Payment(client);
const preference = new Preference(client);

class PaymentService {
  /**
   * Criar preferência de pagamento para checkout
   */
  async criarPreferencia(dadosPedido) {
    try {
      const { itens, total, usuario, pedidoId } = dadosPedido;
      
      const preferenceData = {
        items: itens.map(item => ({
          id: item.produto_id,
          title: item.nome,
          quantity: item.quantidade,
          unit_price: parseFloat(item.preco_unitario),
          currency_id: 'BRL'
        })),
        payer: {
          name: usuario.nome,
          email: usuario.email
        },
        back_urls: {
          success: `${config.frontend?.url || 'http://localhost:3000'}/pagamento/sucesso`,
          failure: `${config.frontend?.url || 'http://localhost:3000'}/pagamento/erro`,
          pending: `${config.frontend?.url || 'http://localhost:3000'}/pagamento/pendente`
        },
        auto_return: 'approved',
        external_reference: pedidoId.toString(),
        notification_url: `${config.backend?.url || 'http://localhost:5000'}/api/payments/webhook`,
        statement_descriptor: 'EU TENHO SONHOS',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };

      const result = await preference.create({ body: preferenceData });
      
      return {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
      };
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      throw new Error('Erro ao processar pagamento');
    }
  }

  /**
   * Processar pagamento direto (cartão)
   */
  async processarPagamento(dadosPagamento) {
    try {
      const {
        token,
        transaction_amount,
        description,
        payment_method_id,
        payer,
        external_reference
      } = dadosPagamento;

      const paymentData = {
        transaction_amount: parseFloat(transaction_amount),
        token,
        description,
        payment_method_id,
        payer: {
          email: payer.email,
          identification: {
            type: payer.identification?.type || 'CPF',
            number: payer.identification?.number
          }
        },
        external_reference,
        installments: 1,
        capture: true
      };

      const result = await payment.create({ body: paymentData });
      
      return {
        id: result.id,
        status: result.status,
        status_detail: result.status_detail,
        transaction_amount: result.transaction_amount,
        external_reference: result.external_reference
      };
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw new Error('Erro ao processar pagamento');
    }
  }

  /**
   * Consultar status do pagamento
   */
  async consultarPagamento(paymentId) {
    try {
      const result = await payment.get({ id: paymentId });
      
      return {
        id: result.id,
        status: result.status,
        status_detail: result.status_detail,
        transaction_amount: result.transaction_amount,
        external_reference: result.external_reference,
        date_created: result.date_created,
        date_approved: result.date_approved
      };
    } catch (error) {
      console.error('Erro ao consultar pagamento:', error);
      throw new Error('Erro ao consultar pagamento');
    }
  }

  /**
   * Processar webhook do Mercado Pago
   */
  async processarWebhook(data) {
    try {
      const { type, data: webhookData } = data;
      
      if (type === 'payment') {
        const paymentInfo = await this.consultarPagamento(webhookData.id);
        return paymentInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw new Error('Erro ao processar webhook');
    }
  }

  /**
   * Gerar PIX
   */
  async gerarPix(dadosPix) {
    try {
      const { transaction_amount, description, payer, external_reference } = dadosPix;
      
      const paymentData = {
        transaction_amount: parseFloat(transaction_amount),
        description,
        payment_method_id: 'pix',
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name,
          identification: {
            type: 'CPF',
            number: payer.identification?.number
          }
        },
        external_reference
      };

      const result = await payment.create({ body: paymentData });
      
      return {
        id: result.id,
        status: result.status,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: result.point_of_interaction?.transaction_data?.ticket_url
      };
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      throw new Error('Erro ao gerar PIX');
    }
  }
}

module.exports = new PaymentService();