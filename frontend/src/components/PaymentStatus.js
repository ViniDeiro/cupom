import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentStatus = ({ pedidoId, onStatusUpdate }) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkPaymentStatus = async () => {
    if (!pedidoId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/payments/order-status/${pedidoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data);
        setLastChecked(new Date());
        
        if (onStatusUpdate) {
          onStatusUpdate(data);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();
    
    // Verificar status a cada 30 segundos se o pagamento estiver pendente
    const interval = setInterval(() => {
      if (paymentStatus?.status === 'pending' || paymentStatus?.status === 'in_process') {
        checkPaymentStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [pedidoId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'pending':
      case 'in_process':
        return <Clock className="text-yellow-500" size={24} />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <AlertCircle className="text-gray-500" size={24} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Pagamento Aprovado';
      case 'pending':
        return 'Pagamento Pendente';
      case 'in_process':
        return 'Processando Pagamento';
      case 'rejected':
        return 'Pagamento Rejeitado';
      case 'cancelled':
        return 'Pagamento Cancelado';
      default:
        return 'Status Desconhecido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'pending':
      case 'in_process':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'rejected':
      case 'cancelled':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusDescription = (status, statusDetail) => {
    switch (status) {
      case 'approved':
        return 'Seu pagamento foi aprovado com sucesso!';
      case 'pending':
        if (statusDetail === 'pending_waiting_payment') {
          return 'Aguardando confirmação do pagamento.';
        }
        return 'Pagamento em análise.';
      case 'in_process':
        return 'Seu pagamento está sendo processado.';
      case 'rejected':
        switch (statusDetail) {
          case 'cc_rejected_insufficient_amount':
            return 'Cartão sem limite suficiente.';
          case 'cc_rejected_bad_filled_security_code':
            return 'Código de segurança inválido.';
          case 'cc_rejected_bad_filled_date':
            return 'Data de vencimento inválida.';
          default:
            return 'Pagamento rejeitado. Verifique os dados do cartão.';
        }
      case 'cancelled':
        return 'Pagamento foi cancelado.';
      default:
        return 'Verificando status do pagamento...';
    }
  };

  if (!paymentStatus && !loading) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-4">
        <CreditCard size={24} className="text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Status do Pagamento</h3>
      </div>

      {loading && !paymentStatus ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Verificando status...</span>
        </div>
      ) : paymentStatus ? (
        <div className="space-y-4">
          <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getStatusColor(paymentStatus.status)}`}>
            {getStatusIcon(paymentStatus.status)}
            <div className="flex-1">
              <h4 className="font-semibold">{getStatusText(paymentStatus.status)}</h4>
              <p className="text-sm opacity-90">
                {getStatusDescription(paymentStatus.status, paymentStatus.status_detail)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">ID do Pagamento:</span>
              <p className="font-mono text-xs">{paymentStatus.id}</p>
            </div>
            <div>
              <span className="text-gray-600">Valor:</span>
              <p className="font-semibold">R$ {paymentStatus.transaction_amount?.toFixed(2)}</p>
            </div>
            {paymentStatus.date_approved && (
              <div className="col-span-2">
                <span className="text-gray-600">Data de Aprovação:</span>
                <p>{new Date(paymentStatus.date_approved).toLocaleString('pt-BR')}</p>
              </div>
            )}
          </div>

          {(paymentStatus.status === 'pending' || paymentStatus.status === 'in_process') && (
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-gray-600">
                Última verificação: {lastChecked?.toLocaleTimeString('pt-BR')}
              </span>
              <button
                onClick={checkPaymentStatus}
                disabled={loading}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm"
              >
                {loading ? 'Verificando...' : 'Atualizar Status'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
          <p>Não foi possível verificar o status do pagamento</p>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;