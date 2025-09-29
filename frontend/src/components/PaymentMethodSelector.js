import React, { useState } from 'react';
import CouponPayment from './CouponPayment';
import CardPayment from './CardPayment';

const PaymentMethodSelector = ({ couponType, onClose, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  if (selectedMethod === 'pix') {
    return (
      <CouponPayment
        couponType={couponType}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  if (selectedMethod === 'card') {
    return (
      <CardPayment
        couponType={couponType}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Escolha o método de pagamento</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">{couponType.nome}</h3>
          <p className="text-blue-600">{couponType.desconto_percentual}% de desconto</p>
          <p className="text-lg font-bold text-blue-800">R$ {couponType.preco.toFixed(2)}</p>
        </div>

        <div className="space-y-4">
          {/* Opção PIX */}
          <button
            onClick={() => setSelectedMethod('pix')}
            className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">PIX</h3>
                  <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600 font-medium">Aprovação imediata</p>
                <p className="text-xs text-gray-500">QR Code ou Pix Copia e Cola</p>
              </div>
            </div>
          </button>

          {/* Opção Cartão de Crédito */}
          <button
            onClick={() => setSelectedMethod('card')}
            className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Cartão de Crédito</h3>
                  <p className="text-sm text-gray-600">Visa, Mastercard</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600 font-medium">Até 3x sem juros</p>
                <p className="text-xs text-gray-500">Processamento seguro</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>🔒 Todos os pagamentos são processados de forma segura pelo Mercado Pago</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;