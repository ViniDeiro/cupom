import React, { useState, useEffect } from 'react';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../services/apiUtils';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Buscando pedidos da API...');
      
      const response = await ordersAPI.getAllOrders();
      console.log('Resposta da API de pedidos:', response.data);
      
      if (response.data && response.data.pedidos) {
        // Mapear os dados para o formato esperado pelo componente
        const mappedOrders = response.data.pedidos.map(pedido => ({
          id: pedido.id,
          orderNumber: `PED-${String(pedido.id).padStart(3, '0')}`,
          customer: pedido.usuario ? pedido.usuario.nome : 'Usuário não encontrado',
          email: pedido.usuario ? pedido.usuario.email : 'N/A',
          date: new Date(pedido.createdAt).toLocaleDateString('pt-BR'),
          status: mapOrderStatus(pedido.status),
          total: parseFloat(pedido.total_final || 0),
          items: pedido.itens ? pedido.itens.length : 0
        }));
        
        setOrders(mappedOrders);
        console.log('Pedidos carregados:', mappedOrders.length);
      } else {
        console.warn('Formato de resposta inesperado:', response.data);
        setOrders([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos: ' + (error.response?.data?.erro || error.message));
      setOrders([]);
      setLoading(false);
    }
  };

  // Mapear status do backend para o frontend
  const mapOrderStatus = (backendStatus) => {
    const statusMap = {
      'pendente': 'processing',
      'confirmado': 'processing',
      'preparando': 'processing',
      'enviado': 'processing',
      'entregue': 'delivered',
      'cancelado': 'cancelled'
    };
    return statusMap[backendStatus] || 'processing';
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Mapear status do frontend para o backend
      const backendStatusMap = {
        'processing': 'confirmado',
        'delivered': 'entregue',
        'cancelled': 'cancelado'
      };
      
      const backendStatus = backendStatusMap[newStatus] || 'pendente';
      
      await ordersAPI.updateOrderStatus(orderId, backendStatus);
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status: ' + (error.response?.data?.erro || error.message));
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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return <Loading text="Carregando pedidos..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pedidos</h1>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">Todos os pedidos</option>
          <option value="processing">Processando</option>
          <option value="delivered">Entregues</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items} {order.items === 1 ? 'item' : 'itens'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  R$ {order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="processing">Processando</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Ainda não há pedidos cadastrados.'
              : `Não há pedidos com status "${getStatusText(filter)}".`
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;