import React, { useState, useEffect } from 'react';
import Loading from '../../components/Loading';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('Iniciando carregamento do dashboard...');
      const token = localStorage.getItem('token');
      const admin = localStorage.getItem('admin');
      console.log('Token encontrado:', !!token);
      console.log('Admin encontrado:', !!admin);
      
      if (!token || !admin) {
        console.error('Token ou dados de admin não encontrados');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`Erro ao carregar estatísticas: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      if (!data.estatisticas) {
        console.error('Estrutura de dados inválida:', data);
        throw new Error('Dados de estatísticas não encontrados');
      }

      setStats({
        totalUsers: data.estatisticas.totalUsers || 0,
        totalOrders: data.estatisticas.totalOrders || 0,
        totalRevenue: data.estatisticas.totalRevenue || 0,
        activeCoupons: data.estatisticas.activeCoupons || 0,
        recentOrders: (data.recentOrders || []).map(order => ({
          id: order.id,
          customer: order.customer || 'N/A',
          total: order.total || 0,
          status: order.status === 'pending' ? 'processing' : 
                  order.status === 'completed' ? 'delivered' : order.status
        }))
      });
      console.log('Dashboard carregado com sucesso');
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <Loading text="Carregando dashboard..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Administrativo</h1>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl text-blue-500 mr-4">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl text-green-500 mr-4">📦</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl text-yellow-500 mr-4">💰</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {(stats?.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl text-purple-500 mr-4">🎫</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cupons Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeCoupons || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pedidos recentes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pedidos Recentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(stats?.recentOrders || []).map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {(order.total || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status === 'delivered' ? 'Entregue' : 'Processando'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;