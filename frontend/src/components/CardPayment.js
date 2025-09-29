import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import SuccessAnimation from './SuccessAnimation';

const CardPayment = ({ couponType, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cpf, setCpf] = useState('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
    cardholderName: '',
    installments: 1
  });

  // Função para validar CPF
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

  // Função para formatar CPF
  const formatCPF = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Função para formatar número do cartão
  const formatCardNumber = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Função para formatar data de expiração
  const formatExpiryDate = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return cleanValue.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    }
    return cleanValue;
  };

  const handleCpfChange = (e) => {
    const formattedCpf = formatCPF(e.target.value);
    setCpf(formattedCpf);
  };

  const handleCardDataChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'securityCode') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  // Simular criação de token do cartão (em produção, usar SDK do Mercado Pago)
  const createCardToken = async () => {
    // Esta é uma simulação. Em produção, você usaria o SDK do Mercado Pago
    // para criar um token seguro do cartão
    const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '');
    const [month, year] = cardData.expiryDate.split('/');
    
    // Validações básicas
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      throw new Error('Número do cartão inválido');
    }
    
    if (!month || !year || month < 1 || month > 12) {
      throw new Error('Data de expiração inválida');
    }
    
    if (cardData.securityCode.length < 3) {
      throw new Error('Código de segurança inválido');
    }
    
    if (!cardData.cardholderName.trim()) {
      throw new Error('Nome do portador é obrigatório');
    }
    
    // Determinar tipo do cartão baseado no número
    let paymentMethodId = 'visa';
    if (cleanCardNumber.startsWith('5')) {
      paymentMethodId = 'master';
    } else if (cleanCardNumber.startsWith('4')) {
      paymentMethodId = 'visa';
    }
    
    // Simular token (em produção, isso seria feito pelo SDK do MP)
    return {
      token: `card_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payment_method_id: paymentMethodId
    };
  };

  const handleBuyWithCard = async () => {
    setLoading(true);
    
    try {
      // Validar CPF se fornecido
      if (cpf && !isValidCPF(cpf)) {
        toast.error('CPF inválido');
        return;
      }
      
      // Criar token do cartão
      const { token, payment_method_id } = await createCardToken();
      
      const requestData = {
        tipo_cupom_id: couponType.id,
        token,
        payment_method_id,
        installments: parseInt(cardData.installments)
      };
      
      // Se o usuário forneceu CPF, incluir na requisição
      if (cpf) {
        requestData.cpf = cpf.replace(/\D/g, '');
      }
      
      console.log('Dados enviados para pagamento com cartão:', requestData);
      
      const response = await api.post('/coupon-payments/buy-coupon-card', requestData);
      
      if (response.data.pagamento.status === 'approved') {
        setShowSuccess(true);
        toast.success('Pagamento aprovado! Cupom ativado com sucesso!');
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(response.data.cupom);
          }
        }, 2000);
      } else {
        toast.error(`Pagamento ${response.data.pagamento.status}. Verifique os dados do cartão.`);
      }
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      if (error.response?.data?.erro) {
        toast.error(error.response.data.erro);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao processar pagamento com cartão');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <SuccessAnimation
          title="Pagamento Aprovado!"
          subtitle="Seu cupom foi ativado com sucesso!"
          onComplete={() => {
            setShowSuccess(false);
            onClose();
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pagamento com Cartão</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">{couponType.nome}</h3>
          <p className="text-blue-600">{couponType.desconto_percentual}% de desconto</p>
          <p className="text-lg font-bold text-blue-800">R$ {couponType.preco.toFixed(2)}</p>
        </div>

        <div className="space-y-4">
          {/* CPF (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF (opcional)
            </label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Número do cartão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número do cartão *
            </label>
            <input
              type="text"
              value={cardData.cardNumber}
              onChange={(e) => handleCardDataChange('cardNumber', e.target.value)}
              placeholder="0000 0000 0000 0000"
              maxLength={23}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Nome do portador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do portador *
            </label>
            <input
              type="text"
              value={cardData.cardholderName}
              onChange={(e) => handleCardDataChange('cardholderName', e.target.value)}
              placeholder="Nome como está no cartão"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Data de expiração */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiração *
              </label>
              <input
                type="text"
                value={cardData.expiryDate}
                onChange={(e) => handleCardDataChange('expiryDate', e.target.value)}
                placeholder="MM/AA"
                maxLength={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Código de segurança */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV *
              </label>
              <input
                type="text"
                value={cardData.securityCode}
                onChange={(e) => handleCardDataChange('securityCode', e.target.value)}
                placeholder="000"
                maxLength={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Parcelas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parcelas
            </label>
            <select
              value={cardData.installments}
              onChange={(e) => handleCardDataChange('installments', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1x de R$ {couponType.preco.toFixed(2)} sem juros</option>
              <option value={2}>2x de R$ {(couponType.preco / 2).toFixed(2)} sem juros</option>
              <option value={3}>3x de R$ {(couponType.preco / 3).toFixed(2)} sem juros</option>
            </select>
          </div>

          <button
            onClick={handleBuyWithCard}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Processando...' : `Pagar R$ ${couponType.preco.toFixed(2)}`}
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>🔒 Pagamento seguro processado pelo Mercado Pago</p>
        </div>
      </div>
    </div>
  );
};

export default CardPayment;