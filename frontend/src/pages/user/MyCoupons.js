import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

function MyCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCoupons();
  }, []);

  const fetchMyCoupons = async () => {
    try {
      setLoading(true);
      const { couponsAPI } = await import('../../services/apiUtils');
      const response = await couponsAPI.getMyCoupons();
      console.log('Cupons recebidos da API:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Mapear os dados da API para o formato esperado pelo componente
        const mappedCoupons = response.data.map(cupom => ({
          id: cupom.id,
          code: cupom.codigo,
          discount: cupom.desconto,
          type: 'percentage',
          status: cupom.valido ? (cupom.usado ? 'used' : 'active') : 'expired',
          expiresAt: cupom.data_validade,
          usedAt: cupom.data_uso
        }));
        
        setCoupons(mappedCoupons);
      } else {
        console.warn('Formato de resposta inesperado:', response.data);
        setCoupons([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      toast.error('Erro ao carregar cupons');
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  if (loading) {
    return <Loading text="Carregando seus cupons..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Cupons</h1>

      {coupons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Você ainda não possui cupons
          </h3>
          <p className="text-gray-600 mb-6">
            Compre produtos ou participe de promoções para ganhar cupons de desconto!
          </p>
          <a
            href="/produtos"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ver Produtos
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                coupon.status === 'active'
                  ? 'border-green-500'
                  : coupon.status === 'used'
                  ? 'border-gray-400'
                  : 'border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {coupon.code}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {coupon.type === 'percentage'
                      ? `${coupon.discount}% de desconto`
                      : `R$ ${coupon.discount.toFixed(2)} de desconto`}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    coupon.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : coupon.status === 'used'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {coupon.status === 'active'
                    ? 'Ativo'
                    : coupon.status === 'used'
                    ? 'Usado'
                    : 'Expirado'}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>Expira em: {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}</p>
                {coupon.usedAt && (
                  <p>Usado em: {new Date(coupon.usedAt).toLocaleDateString('pt-BR')}</p>
                )}
              </div>

              {coupon.status === 'active' && (
                <button
                  onClick={() => copyToClipboard(coupon.code)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Copiar Código
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCoupons;