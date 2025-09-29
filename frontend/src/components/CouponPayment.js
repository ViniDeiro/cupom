import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import SuccessAnimation from './SuccessAnimation';

const CouponPayment = ({ couponType, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [cpf, setCpf] = useState('');
  const [needsCpf, setNeedsCpf] = useState(true); // Sempre mostrar campo CPF para teste

  // Verificar status do pagamento periodicamente
  useEffect(() => {
    let interval;
    if (pixData && paymentStatus === 'pending') {
      interval = setInterval(async () => {
        try {
          setCheckingPayment(true);
          const response = await api.get(`/coupon-payments/coupon-payment-status/${pixData.payment_id}`);
          
          if (response.data.pagamento.status === 'approved') {
            setPaymentStatus('approved');
            toast.success('Pagamento aprovado! Cupom ativado com sucesso!');
            if (onSuccess) {
              onSuccess(response.data.cupom);
            }
            clearInterval(interval);
          } else if (response.data.pagamento.status === 'rejected') {
            setPaymentStatus('rejected');
            toast.error('Pagamento rejeitado. Tente novamente.');
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        } finally {
          setCheckingPayment(false);
        }
      }, 5000); // Verificar a cada 5 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pixData, paymentStatus, onSuccess]);

  const handleBuyCoupon = async () => {
    setLoading(true);
    try {
      const requestData = {
        tipo_cupom_id: couponType.id
      };
      
      // Se o usuário forneceu CPF, incluir na requisição
      if (cpf) {
        requestData.cpf = cpf.replace(/\D/g, '');
      }
      
      console.log('=== DEBUG FRONTEND ===');
      console.log('Dados enviados:', requestData);
      console.log('CPF original:', cpf);
      console.log('CPF limpo:', cpf ? cpf.replace(/\D/g, '') : 'não fornecido');
      console.log('===================');
      
      const response = await api.post('/coupon-payments/buy-coupon-pix', requestData);

      setPixData(response.data.pix);
      toast.success('PIX gerado com sucesso! Escaneie o QR Code para pagar.');
    } catch (error) {
      console.error('Erro ao comprar cupom:', error);
      if (error.response?.data?.erro) {
        // Se o erro for relacionado ao CPF, mostrar campo para inserir
        if (error.response.data.erro.includes('CPF não cadastrado') || 
            error.response.data.erro.includes('CPF inválido')) {
          setNeedsCpf(true);
          toast.error('Por favor, informe seu CPF para gerar o PIX');
        } else {
          toast.error(error.response.data.erro);
        }
        setNeedsCpf(true); // Sempre mostrar campo para debug
      } else {
        toast.error('Erro ao processar compra do cupom');
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleCpfChange = (e) => {
    const formattedCpf = formatCPF(e.target.value);
    setCpf(formattedCpf);
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      toast.success('Código PIX copiado!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Comprar Cupom com PIX</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {!pixData ? (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">{couponType.nome}</h3>
              <p className="text-gray-600">{couponType.descricao}</p>
              <p className="text-green-600 font-bold text-xl mt-2">
                {couponType.desconto}% de desconto
              </p>
              <p className="text-lg font-semibold">
                Preço: R$ {couponType.preco?.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                Válido por {couponType.validade_dias} dias
              </p>
            </div>

            {needsCpf && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF (obrigatório para PIX) *
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {cpf && !isValidCPF(cpf) && (
                  <p className="text-red-500 text-sm mt-1">CPF inválido</p>
                )}
              </div>
            )}

            <button
              onClick={handleBuyCoupon}
              disabled={loading || (needsCpf && (!cpf || !isValidCPF(cpf)))}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Gerando PIX...' : 'Comprar com PIX'}
            </button>
          </div>
        ) : (
          <div>
            {paymentStatus === 'approved' ? (
              <SuccessAnimation 
                title="Pagamento Aprovado!"
                subtitle="Seu cupom foi ativado com sucesso!"
                onComplete={() => {
                  // Fechar modal após 3 segundos
                  setTimeout(() => {
                    onClose();
                  }, 1000);
                }}
              />
            ) : paymentStatus === 'rejected' ? (
              <div className="text-center">
                <div className="text-red-600 text-6xl mb-4">✗</div>
                <h3 className="text-xl font-bold text-red-600 mb-2">
                  Pagamento Rejeitado
                </h3>
                <p className="text-gray-600">
                  Tente novamente ou use outro método de pagamento.
                </p>
                <button
                  onClick={() => {
                    setPixData(null);
                    setPaymentStatus('pending');
                  }}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Escaneie o QR Code para pagar
                  </h3>
                  <div className="bg-white p-4 rounded-lg border inline-block">
                    <QRCode value={pixData.qr_code} size={200} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código PIX (Copia e Cola):
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={pixData.qr_code}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={copyPixCode}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {checkingPayment ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Verificando pagamento...
                      </span>
                    ) : (
                      'Aguardando pagamento...'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    O status será atualizado automaticamente após o pagamento
                  </p>
                </div>

                {pixData.ticket_url && (
                  <div className="mt-4 text-center">
                    <a
                      href={pixData.ticket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Ver comprovante no Mercado Pago
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponPayment;