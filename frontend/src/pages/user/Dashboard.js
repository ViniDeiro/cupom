import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Tag, 
  ShoppingBag, 
  CreditCard, 
  Gift,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { couponsAPI, ordersAPI, formatCurrency, formatDate } from '../../services/apiUtils';
import Loading from '../../components/Loading';

const Dashboard = () => {
  const { user, getCurrentUserName } = useAuth();

  // Verificar se é dia especial
  const { data: specialDayData } = useQuery(
    'specialDay',
    couponsAPI.checkSpecialDay,
    {
      staleTime: 5 * 60 * 1000,
      retry: false,
      onError: () => {}
    }
  );

  // Buscar cupons do usuário
  const { data: couponsData, isLoading: couponsLoading } = useQuery(
    'userCoupons',
    couponsAPI.getMyCoupons,
    {
      staleTime: 2 * 60 * 1000
    }
  );

  // Buscar pedidos recentes
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    'userOrders',
    () => ordersAPI.getMyOrders({ limit: 5 }),
    {
      staleTime: 2 * 60 * 1000
    }
  );

  const isSpecialDay = specialDayData?.data?.dia_especial;
  const specialDayInfo = specialDayData?.data?.evento;
  const cupons = couponsData?.data?.cupons || [];
  const pedidos = ordersData?.data?.pedidos || [];

  // Estatísticas dos cupons
  const cuponsValidos = cupons.filter(c => c.valido && !c.usado);
  const cuponsUsados = cupons.filter(c => c.usado);
  const cuponsExpirados = cupons.filter(c => !c.valido && !c.usado);
  const valorTotalCupons = cupons.reduce((total, cupom) => total + parseFloat(cupom.valor_pago), 0);

  // Estatísticas dos pedidos
  const valorTotalPedidos = pedidos.reduce((total, pedido) => total + parseFloat(pedido.total_final), 0);
  const economiaTotal = pedidos.reduce((total, pedido) => total + parseFloat(pedido.desconto_cupom || 0), 0);

  if (couponsLoading || ordersLoading) {
    return <Loading fullScreen text="Carregando seu dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Olá, {getCurrentUserName()}! 👋
              </h1>
              <p className="text-gray-600">
                {isSpecialDay ? (
                  <>
                    🎉 <strong>{specialDayInfo?.nome}</strong> está ativo! Use seus cupons agora!
                  </>
                ) : (
                  'Bem-vindo ao seu painel. Aqui você pode gerenciar seus cupons e pedidos.'
                )}
              </p>
            </div>
            
            {isSpecialDay && (
              <div className="mt-4 lg:mt-0">
                <Link
                  to="/produtos"
                  className="btn-cupom flex items-center"
                >
                  <Sparkles className="mr-2" size={16} />
                  Usar Cupons Agora!
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas */}
        {isSpecialDay && (
          <div className="mb-8 bg-gradient-to-r from-cupom-500 to-primary-600 text-white rounded-xl p-6">
            <div className="flex items-center">
              <Sparkles className="mr-3" size={24} />
              <div>
                <h3 className="font-semibold text-lg">{specialDayInfo?.nome} Ativo!</h3>
                <p className="text-cupom-100">{specialDayInfo?.descricao}</p>
                {specialDayInfo?.desconto_adicional && (
                  <p className="text-yellow-300 font-medium mt-1">
                    Desconto adicional de {specialDayInfo.desconto_adicional}% em toda a loja!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cupons Válidos</p>
                <p className="text-2xl font-bold text-green-600">{cuponsValidos.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Prontos para usar</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cupons Usados</p>
                <p className="text-2xl font-bold text-blue-600">{cuponsUsados.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Já utilizados</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Investido</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(valorTotalCupons)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Em cupons</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Economia Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(economiaTotal)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Com os cupons</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cupons Recentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Meus Cupons</h2>
              <Link
                to="/meus-cupons"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Ver todos
              </Link>
            </div>

            {cupons.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cupom ainda</h3>
                <p className="text-gray-600 mb-4">Compre seu primeiro cupom e comece a economizar!</p>
                <Link to="/comprar-cupons" className="btn-primary">
                  <Gift className="mr-2" size={16} />
                  Comprar Cupons
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cupons.slice(0, 3).map((cupom) => (
                  <div
                    key={cupom.id}
                    className={`p-4 rounded-lg border-2 border-dashed ${
                      cupom.valido && !cupom.usado
                        ? 'border-green-300 bg-green-50'
                        : cupom.usado
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-lg font-bold text-gray-900">
                          {cupom.codigo}
                        </p>
                        <p className="text-sm text-gray-600">
                          {cupom.desconto}% de desconto
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {formatCurrency(cupom.valor_pago)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          cupom.valido && !cupom.usado
                            ? 'bg-green-100 text-green-800'
                            : cupom.usado
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cupom.valido && !cupom.usado
                            ? 'Válido'
                            : cupom.usado
                            ? 'Usado'
                            : 'Expirado'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      Válido até {formatDate(cupom.data_validade)}
                    </div>
                  </div>
                ))}
                
                {cupons.length > 3 && (
                  <div className="text-center pt-4">
                    <Link
                      to="/meus-cupons"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Ver mais {cupons.length - 3} cupons
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pedidos Recentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Pedidos Recentes</h2>
              <Link
                to="/meus-pedidos"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Ver todos
              </Link>
            </div>

            {pedidos.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido ainda</h3>
                <p className="text-gray-600 mb-4">Quando você fizer um pedido, ele aparecerá aqui.</p>
                <Link to="/produtos" className="btn-primary">
                  Explorar Produtos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.slice(0, 3).map((pedido) => (
                  <div key={pedido.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        Pedido #{pedido.numero}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pedido.status === 'entregue' ? 'bg-green-100 text-green-800' :
                        pedido.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                        pedido.status === 'preparando' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.status === 'confirmado' ? 'bg-purple-100 text-purple-800' :
                        pedido.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatDate(pedido.createdAt)}</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(pedido.total_final)}
                      </span>
                    </div>
                    {pedido.desconto_cupom > 0 && (
                      <div className="mt-1 text-xs text-green-600">
                        Economia: {formatCurrency(pedido.desconto_cupom)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/comprar-cupons"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-cupom-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="text-cupom-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Comprar Cupons</h3>
                <p className="text-sm text-gray-600">Adquira mais cupons de desconto</p>
              </div>
            </div>
          </Link>

          <Link
            to="/produtos"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="text-primary-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Ver Produtos</h3>
                <p className="text-sm text-gray-600">Explore nosso catálogo</p>
              </div>
            </div>
          </Link>

          <Link
            to="/meus-pedidos"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Meus Pedidos</h3>
                <p className="text-sm text-gray-600">Acompanhe seus pedidos</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
