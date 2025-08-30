import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentForm = ({ pedidoId, total, onPaymentSuccess, onPaymentError }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    cpf: ''
  });
  const [pixData, setPixData] = useState(null);
  const [mercadoPagoLoaded, setMercadoPagoLoaded] = useState(false);
  const [publicKey, setPublicKey] = useState(null);

  // Carregar configurações e SDK do Mercado Pago
  useEffect(() => {
    const loadMercadoPago = async () => {
      try {
        // Buscar chave pública da API
        const configResponse = await fetch('/api/config/public');
        const config = await configResponse.json();
        
        if (!config.mercadoPago?.publicKey) {
          throw new Error('Chave pública do Mercado Pago não encontrada');
        }
        
        setPublicKey(config.mercadoPago.publicKey);
        
        // Carregar SDK do Mercado Pago
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => {
          // Inicializar Mercado Pago com chave pública
          window.mp = new window.MercadoPago(config.mercadoPago.publicKey, {
            locale: 'pt-BR'
          });
          setMercadoPagoLoaded(true);
        };
        script.onerror = () => {
          toast.error('Erro ao carregar SDK do Mercado Pago');
        };
        document.body.appendChild(script);
        
        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      } catch (error) {
        console.error('Erro ao carregar Mercado Pago:', error);
        toast.error('Erro ao inicializar sistema de pagamento');
      }
    };
    
    loadMercadoPago();
  }, []);

  const validateCardData = () => {
    const errors = {};
    
    // Validação do número do cartão (Luhn algorithm)
    if (!cardData.number || !isValidCardNumber(cardData.number.replace(/\s/g, ''))) {
      errors.number = 'Número do cartão inválido';
    }
    
    // Validação da data de vencimento
    if (!cardData.expiry || !isValidExpirationDate(cardData.expiry)) {
      errors.expiry = 'Data de vencimento inválida ou expirada';
    }
    
    // Validação do código de segurança
    if (!cardData.cvv || !isValidSecurityCode(cardData.cvv)) {
      errors.cvv = 'Código de segurança inválido';
    }
    
    // Validação do nome do portador
    if (!cardData.name || !isValidCardholderName(cardData.name)) {
      errors.name = 'Nome do portador inválido';
    }
    
    // Validação do CPF
    if (!cardData.cpf || !isValidCPF(cardData.cpf)) {
      errors.cpf = 'CPF inválido';
    }
    
    return errors;
  };

  // Algoritmo de Luhn para validar número do cartão
  const isValidCardNumber = (cardNumber) => {
    if (!/^\d{13,19}$/.test(cardNumber)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Validar data de vencimento
  const isValidExpirationDate = (expirationDate) => {
    if (!/^\d{2}\/\d{2}$/.test(expirationDate)) return false;
    
    const [month, year] = expirationDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false;
    }
    
    return true;
  };

  // Validar código de segurança
  const isValidSecurityCode = (securityCode) => {
    return /^\d{3,4}$/.test(securityCode);
  };

  // Validar nome do portador
  const isValidCardholderName = (name) => {
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(trimmedName);
  };

  // Validar CPF
  const isValidCPF = (cpf) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    
    return digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10]);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatação automática
    if (name === 'number') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/');
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
    } else if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const processCardPayment = async () => {
    if (!mercadoPagoLoaded) {
      toast.error('SDK do Mercado Pago não carregado');
      return;
    }

    // Validar dados do cartão antes de processar
    const validationErrors = validateCardData();
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    setLoading(true);

    try {
      // Criar token do cartão
      const cardToken = await window.mp.createCardToken({
        cardNumber: cardData.number.replace(/\s/g, ''),
        cardholderName: cardData.name,
        cardExpirationMonth: cardData.expiry.split('/')[0],
        cardExpirationYear: `20${cardData.expiry.split('/')[1]}`,
        securityCode: cardData.cvv,
        identificationType: 'CPF',
        identificationNumber: cardData.cpf.replace(/\D/g, '')
      });

      if (cardToken.error) {
        throw new Error(cardToken.error.message);
      }

      // Processar pagamento
      const response = await fetch('/api/payments/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          token: cardToken.id,
          payment_method_id: 'visa', // Detectar automaticamente
          pedido_id: pedidoId,
          payer: {
            email: 'user@example.com', // Pegar do contexto do usuário
            identification: {
              type: 'CPF',
              number: cardData.cpf.replace(/\D/g, '')
            }
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.erro || 'Erro ao processar pagamento');
      }

      if (result.status === 'approved') {
        toast.success('Pagamento aprovado!');
        onPaymentSuccess(result);
      } else if (result.status === 'pending') {
        toast.info('Pagamento pendente de aprovação');
        onPaymentSuccess(result);
      } else {
        toast.error('Pagamento rejeitado');
        onPaymentError(result);
      }

    } catch (error) {
      console.error('Erro no pagamento:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      onPaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePix = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/payments/generate-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          pedido_id: pedidoId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.erro || 'Erro ao gerar PIX');
      }

      setPixData(result);
      toast.success('PIX gerado com sucesso!');

    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      toast.error(error.message || 'Erro ao gerar PIX');
      onPaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'pix') {
      await generatePix();
    } else {
      await processCardPayment();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">Forma de Pagamento</h3>

      {/* Seleção do método de pagamento */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('credit')}
            className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
              paymentMethod === 'credit'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard size={20} />
            <span>Cartão de Crédito</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('pix')}
            className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
              paymentMethod === 'pix'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <QrCode size={20} />
            <span>PIX</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {paymentMethod === 'credit' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do Cartão
              </label>
              <input
                type="text"
                name="number"
                value={cardData.number}
                onChange={handleCardInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validade
                </label>
                <input
                  type="text"
                  name="expiry"
                  value={cardData.expiry}
                  onChange={handleCardInputChange}
                  placeholder="MM/AA"
                  maxLength="5"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleCardInputChange}
                  placeholder="123"
                  maxLength="4"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome no Cartão
              </label>
              <input
                type="text"
                name="name"
                value={cardData.name}
                onChange={handleCardInputChange}
                placeholder="Nome como está no cartão"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={cardData.cpf}
                onChange={handleCardInputChange}
                placeholder="000.000.000-00"
                maxLength="14"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {paymentMethod === 'pix' && !pixData && (
          <div className="text-center py-8">
            <QrCode size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Clique no botão abaixo para gerar o código PIX
            </p>
          </div>
        )}

        {pixData && (
          <div className="text-center py-6">
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              {pixData.qr_code_base64 && (
                <img
                  src={`data:image/png;base64,${pixData.qr_code_base64}`}
                  alt="QR Code PIX"
                  className="mx-auto mb-4 max-w-xs"
                />
              )}
              
              <div className="bg-white rounded border p-3 mb-4">
                <p className="text-xs text-gray-600 mb-1">Código PIX:</p>
                <p className="font-mono text-sm break-all">{pixData.qr_code}</p>
              </div>
              
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(pixData.qr_code)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Copiar Código PIX
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              Valor: <span className="font-semibold">R$ {total.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Após o pagamento, seu pedido será processado automaticamente.
            </p>
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || (paymentMethod === 'pix' && pixData)}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading && <Loader className="animate-spin" size={20} />}
            <span>
              {loading
                ? 'Processando...'
                : paymentMethod === 'pix'
                ? pixData
                  ? 'PIX Gerado'
                  : 'Gerar PIX'
                : `Pagar R$ ${total.toFixed(2)}`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;