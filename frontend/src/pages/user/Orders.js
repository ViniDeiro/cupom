import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Eye, CreditCard } from 'lucide-react';
import PaymentStatus from '../../components/PaymentStatus';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error('Erro ao carregar pedidos');
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pendente':
        return <Clock className="text-yellow-500" size={20} />;
      case 'cancelado':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado':
        return 'text-green-700 bg-green-50';
      case 'pendente':
        return 'text-yellow-700 bg-yellow-50';
      case 'cancelado':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleViewPaymentStatus = (order) => {
    setSelectedOrder(order);
    setShowPaymentStatus(true);
  };

  const handlePaymentStatusUpdate = (paymentData) => {
    // Atualizar o status do pedido baseado no status do pagamento
    if (paymentData.status === 'approved') {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: 'confirmado' }
            : order
        )
      );
      toast.success('Pagamento aprovado!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
          <p className="text-gray-600 mt-2">Acompanhe o status dos seus pedidos</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600">Você ainda não fez nenhum pedido.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Package size={24} className="text-gray-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido #{order.numero}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusText(order.status)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Total:</span>
                      <p className="font-semibold text-lg">R$ {order.total_final?.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Forma de Pagamento:</span>
                      <p className="font-medium">{order.forma_pagamento || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Endereço:</span>
                      <p className="font-medium text-sm">{order.endereco_entrega}</p>
                    </div>
                  </div>

                  {order.observacoes && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Observações:</span>
                      <p className="text-sm">{order.observacoes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye size={16} />
                        <span>Ver Detalhes</span>
                      </button>
                      {order.mercado_pago_payment_id && (
                        <button
                          onClick={() => handleViewPaymentStatus(order)}
                          className="flex items-center space-x-1 bg-primary-100 text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-200 transition-colors"
                        >
                          <CreditCard size={16} />
                          <span>Status Pagamento</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal para detalhes do pedido */}
        {selectedOrder && !showPaymentStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Detalhes do Pedido #{selectedOrder.numero}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <p className="font-semibold">{getStatusText(selectedOrder.status)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Total:</span>
                      <p className="font-semibold">R$ {selectedOrder.total_final?.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Desconto:</span>
                      <p className="font-semibold">R$ {selectedOrder.desconto_cupom?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Data:</span>
                      <p className="font-semibold">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Endereço de Entrega:</span>
                    <p className="font-medium">{selectedOrder.endereco_entrega}</p>
                  </div>

                  {selectedOrder.observacoes && (
                    <div>
                      <span className="text-sm text-gray-600">Observações:</span>
                      <p>{selectedOrder.observacoes}</p>
                    </div>
                  )}

                  {selectedOrder.mercado_pago_payment_id && (
                    <div>
                      <span className="text-sm text-gray-600">ID Pagamento Mercado Pago:</span>
                      <p className="font-mono text-xs">{selectedOrder.mercado_pago_payment_id}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para status de pagamento */}
        {selectedOrder && showPaymentStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Status do Pagamento - Pedido #{selectedOrder.numero}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setShowPaymentStatus(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <PaymentStatus 
                  pedidoId={selectedOrder.id}
                  onStatusUpdate={handlePaymentStatusUpdate}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;