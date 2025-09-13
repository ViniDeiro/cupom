import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/apiUtils';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading';

const AdminReports = () => {
  const [reports, setReports] = useState({
    salesReport: {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topProducts: []
    },
    userReport: {
      totalUsers: 0,
      newUsersThisMonth: 0,
      activeUsers: 0
    },
    couponReport: {
      totalCoupons: 0,
      usedCoupons: 0,
      couponUsageRate: 0
    }
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('Carregando relatórios...');
      
      // Calcular período se não especificado
      let periodo = 30; // padrão 30 dias
      if (dateRange.startDate && dateRange.endDate) {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        periodo = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      }
      
      // Buscar estatísticas de pedidos e cupons
      const [ordersResponse, couponsResponse, dashboardResponse] = await Promise.all([
        adminAPI.getOrdersStats({ periodo }),
        adminAPI.getCouponsStats(),
        adminAPI.getDashboard()
      ]);
      
      console.log('Dados de pedidos:', ordersResponse.data);
      console.log('Dados de cupons:', couponsResponse.data);
      console.log('Dados do dashboard:', dashboardResponse.data);
      
      const ordersData = ordersResponse.data;
      const couponsData = couponsResponse.data;
      const dashboardData = dashboardResponse.data;
      
      setReports({
        salesReport: {
          totalSales: ordersData.receita_total || 0,
          totalOrders: ordersData.total_pedidos || 0,
          averageOrderValue: ordersData.ticket_medio || 0,
          topProducts: [] // Não temos endpoint específico para produtos mais vendidos ainda
        },
        userReport: {
          totalUsers: dashboardData.estatisticas?.totalUsers || 0,
          newUsersThisMonth: 0, // Não temos esse dado específico ainda
          activeUsers: dashboardData.estatisticas?.totalUsers || 0
        },
        couponReport: {
          totalCoupons: couponsData.total_cupons || 0,
          usedCoupons: couponsData.cupons_usados || 0,
          couponUsageRate: couponsData.taxa_uso || 0
        }
      });
      
      console.log('Relatórios carregados com sucesso');
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios: ' + (error.response?.data?.erro || error.message));
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('Por favor, selecione um período válido');
      return;
    }
    fetchReports();
  };

  const exportReport = (type) => {
    // Simulated export functionality
    alert(`Exportando relatório ${type}...`);
  };

  if (loading) {
    return <Loading text="Carregando relatórios..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => exportReport('PDF')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Exportar PDF
          </button>
          <button
            onClick={() => exportReport('Excel')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Sales Report */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Relatório de Vendas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              R$ {reports.salesReport.totalSales.toLocaleString()}
            </div>
            <div className="text-gray-600">Total de Vendas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {reports.salesReport.totalOrders}
            </div>
            <div className="text-gray-600">Total de Pedidos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              R$ {reports.salesReport.averageOrderValue.toFixed(2)}
            </div>
            <div className="text-gray-600">Ticket Médio</div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Produtos Mais Vendidos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Produto</th>
                <th className="px-4 py-2 text-left">Vendas (R$)</th>
                <th className="px-4 py-2 text-left">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {reports.salesReport.topProducts.map((product, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">R$ {product.sales.toLocaleString()}</td>
                  <td className="px-4 py-2">{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Report */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Relatório de Usuários</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {reports.userReport.totalUsers}
            </div>
            <div className="text-gray-600">Total de Usuários</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {reports.userReport.newUsersThisMonth}
            </div>
            <div className="text-gray-600">Novos Usuários (Mês)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {reports.userReport.activeUsers}
            </div>
            <div className="text-gray-600">Usuários Ativos</div>
          </div>
        </div>
      </div>

      {/* Coupon Report */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Relatório de Cupons</h2>
          <a 
            href="/admin/relatorios/cupons" 
            className="text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            Ver relatório detalhado
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {reports.couponReport.totalCoupons}
            </div>
            <div className="text-gray-600">Total de Cupons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {reports.couponReport.usedCoupons}
            </div>
            <div className="text-gray-600">Cupons Utilizados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {reports.couponReport.couponUsageRate.toFixed(1)}%
            </div>
            <div className="text-gray-600">Taxa de Utilização</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;