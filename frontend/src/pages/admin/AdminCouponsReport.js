import React, { useState, useEffect } from 'react';
import { adminAPI, formatCurrency, formatDate } from '../../services/apiUtils';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading';
import { Calendar, Download, Filter, RefreshCw } from 'lucide-react';

const AdminCouponsReport = () => {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [summary, setSummary] = useState({
    total_cupons: 0,
    receita_cupons: 0,
    cupons_usados: 0,
    cupons_validos: 0
  });
  const [filters, setFilters] = useState({
    data_inicio: '',
    data_fim: ''
  });

  useEffect(() => {
    fetchCouponsReport();
  }, []);

  const fetchCouponsReport = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCouponsReport(filters);
      console.log('Relatório de cupons:', response.data);
      
      setCoupons(response.data.cupons || []);
      setSummary(response.data.resumo || {
        total_cupons: 0,
        receita_cupons: 0,
        cupons_usados: 0,
        cupons_validos: 0
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar relatório de cupons:', error);
      toast.error('Erro ao carregar relatório: ' + (error.response?.data?.erro || error.message));
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    fetchCouponsReport();
  };

  const exportReport = (format) => {
    // Simulação de exportação
    toast.success(`Relatório exportado em formato ${format}`);
  };

  if (loading) {
    return <Loading text="Carregando relatório de cupons..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Relatório de Cupons</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => fetchCouponsReport()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Atualizar
          </button>
          <button
            onClick={() => exportReport('Excel')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter size={18} />
          Filtros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.data_inicio}
              onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={filters.data_fim}
              onChange={(e) => handleFilterChange('data_fim', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Resumo</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {summary.total_cupons}
            </div>
            <div className="text-gray-600">Total de Cupons</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(summary.receita_cupons)}
            </div>
            <div className="text-gray-600">Receita Total</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {summary.cupons_usados}
            </div>
            <div className="text-gray-600">Cupons Utilizados</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {summary.cupons_validos}
            </div>
            <div className="text-gray-600">Cupons Válidos</div>
          </div>
        </div>
      </div>

      {/* Lista de Cupons */}
      <div className="bg-white p-6 rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">Lista de Cupons</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{coupon.codigo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.usuario?.nome || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.desconto_percentual}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(coupon.valor_pago)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(coupon.data_compra)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(coupon.data_validade)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        coupon.usado 
                          ? 'bg-gray-100 text-gray-800' 
                          : coupon.isValido 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.usado 
                          ? 'Usado' 
                          : coupon.isValido 
                            ? 'Válido' 
                            : 'Expirado'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum cupom encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCouponsReport;