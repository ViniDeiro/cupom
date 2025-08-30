import React, { useState, useEffect } from 'react';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      // Simulação de pedidos para preview
      setTimeout(() => {
        setOrders([
          {
            id: 1,
            orderNumber: 'PED-001',
            date: '2024-01-15',
            status: 'delivered',
            total: 149.99,
            items: [
              { name: 'Produto A', quantity: 2, price: 49.99 },
              { name: 'Produto B', quantity: 1, price: 50.01 }
            ]
          },
          {
            id: 2,
            orderNumber: 'PED-002',
            date: '2024-01-20',
            status: 'processing',
            total: 89.99,
            items: [
              { name: 'Produto C', quantity: 1, price: 89.99 }
            ]
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Entregue';
      case 'processing':
        return 'Processando';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  };

  if (loading) {
    return <Loading text="Carregando seus pedidos..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Você ainda não fez nenhum pedido
          </h3>
          <p className="text-gray-600 mb-6">
            Explore nossos produtos e faça seu primeiro pedido!
          </p>
          <a
            href="/produtos"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ver Produtos
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pedido #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Data: {new Date(order.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    getStatusColor(order.status)
                  }`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Itens:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.name} (x{item.quantity})
                      </span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total: R$ {order.total.toFixed(2)}
                  </span>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;