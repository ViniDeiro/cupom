import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Gift, 
  Tag, 
  Clock, 
  Star, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { couponsAPI, productsAPI, formatCurrency } from '../services/apiUtils';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

const Home = () => {
  const { isAuthenticated, isUser } = useAuth();

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

  // Buscar produtos em destaque
  const { data: productsData, isLoading: productsLoading } = useQuery(
    'featuredProducts',
    () => productsAPI.getProducts({ limit: 8 }),
    {
      staleTime: 10 * 60 * 1000
    }
  );

  // Buscar tipos de cupons
  const { data: couponTypesData } = useQuery(
    'couponTypes',
    couponsAPI.getTypes,
    {
      staleTime: 30 * 60 * 1000
    }
  );

  const isSpecialDay = specialDayData?.data?.dia_especial;
  const specialDayInfo = specialDayData?.data?.evento;
  const products = productsData?.data?.produtos || [];
  const couponTypes = couponTypesData?.data?.tipos || [];

  const handleAddToCart = (produto) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.produto.id === produto.id);
    
    if (existingItem) {
      existingItem.quantidade += 1;
    } else {
      cart.push({ produto, quantidade: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-cupom-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white bg-opacity-10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cupom-400 bg-opacity-20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Bem-vindo ao <span className="text-cupom-300">Eu Tenho Sonhos</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto animate-fade-in animation-delay-150">
              Realize seus sonhos com nossos cupons especiais! Compre antecipadamente e aproveite descontos exclusivos em dias únicos.
            </p>
            
            {isSpecialDay ? (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 mb-8 animate-bounce-slow">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Sparkles className="text-yellow-300" size={24} />
                  <h2 className="text-2xl font-bold text-yellow-300">
                    {specialDayInfo?.nome} ATIVO!
                  </h2>
                  <Sparkles className="text-yellow-300" size={24} />
                </div>
                <p className="text-lg">{specialDayInfo?.descricao}</p>
                {specialDayInfo?.desconto_adicional && (
                  <p className="text-yellow-300 font-semibold mt-2">
                    Desconto adicional de {specialDayInfo.desconto_adicional}% em toda a loja!
                  </p>
                )}
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-300">
              {isAuthenticated() && isUser() ? (
                <>
                  <Link
                    to="/comprar-cupons"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-cupom-500 hover:bg-cupom-600 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Gift className="mr-2" size={24} />
                    Comprar Cupons
                  </Link>
                  <Link
                    to="/produtos"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all duration-300 backdrop-blur-sm"
                  >
                    <ShoppingBag className="mr-2" size={24} />
                    Ver Produtos
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/registro"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-cupom-500 hover:bg-cupom-600 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Users className="mr-2" size={24} />
                    Criar Conta Grátis
                  </Link>
                  <Link
                    to="/produtos"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all duration-300 backdrop-blur-sm"
                  >
                    <ShoppingBag className="mr-2" size={24} />
                    Explorar Produtos
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona o Eu Tenho Sonhos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um sistema único que permite comprar cupons antecipadamente para usar em dias especiais com grandes descontos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-cupom-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Gift className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Compre Seus Cupons</h3>
              <p className="text-gray-600">
                Escolha entre diferentes tipos de cupons com descontos de 10% a 50%. Cada cupom tem validade de 90 dias.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-cupom-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Aguarde os Dias Especiais</h3>
              <p className="text-gray-600">
                Receba notificações por email quando os dias especiais começarem. Apenas portadores de cupons podem comprar nesses dias.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-cupom-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Aproveite os Descontos</h3>
              <p className="text-gray-600">
                Use seus cupons nos dias especiais e economize muito! Produtos exclusivos ficam disponíveis apenas nestes dias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tipos de Cupons */}
      {couponTypes.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Tipos de Cupons Disponíveis
              </h2>
              <p className="text-xl text-gray-600">
                Escolha o cupom que melhor se adapta ao seu perfil de compras
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {couponTypes.map((tipo, index) => (
                <div 
                  key={tipo.id}
                  className="coupon-card group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                      tipo.id === 1 ? 'bg-amber-100 text-amber-600' :
                      tipo.id === 2 ? 'bg-gray-100 text-gray-600' :
                      tipo.id === 3 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Tag size={24} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tipo.nome}</h3>
                    <div className="text-3xl font-bold text-cupom-600 mb-2">
                      {tipo.desconto}% OFF
                    </div>
                    <div className="text-lg font-semibold text-gray-900 mb-4">
                      {formatCurrency(tipo.preco)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{tipo.descricao}</p>
                    
                    <div className="flex items-center justify-center text-xs text-gray-500 mb-6">
                      <Clock size={14} className="mr-1" />
                      Válido por {tipo.validade_dias} dias
                    </div>

                    {isAuthenticated() && isUser() ? (
                      <Link
                        to="/comprar-cupons"
                        className="btn-cupom w-full group-hover:shadow-lg"
                      >
                        Comprar Agora
                      </Link>
                    ) : (
                      <Link
                        to="/registro"
                        className="btn-secondary w-full"
                      >
                        Criar Conta
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Produtos em Destaque */}
      {products.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Produtos em Destaque
                </h2>
                <p className="text-xl text-gray-600">
                  Confira nossa seleção especial de produtos
                </p>
              </div>
              <Link
                to="/produtos"
                className="hidden md:flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todos os produtos
                <ArrowRight size={20} className="ml-1" />
              </Link>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((produto) => (
                  <ProductCard
                    key={produto.id}
                    produto={produto}
                    onAddToCart={handleAddToCart}
                    isSpecialDay={isSpecialDay}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-12 md:hidden">
              <Link
                to="/produtos"
                className="btn-primary"
              >
                Ver todos os produtos
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Vantagens */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Por Que Escolher o Eu Tenho Sonhos?
            </h2>
            <p className="text-xl text-gray-600">
              Vantagens exclusivas para você economizar de verdade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'Descontos Garantidos',
                description: 'Cupons com validade de 90 dias e descontos de até 50% garantidos.'
              },
              {
                icon: Star,
                title: 'Produtos Exclusivos',
                description: 'Acesso a produtos especiais disponíveis apenas em dias especiais.'
              },
              {
                icon: Users,
                title: 'Comunidade Especial',
                description: 'Faça parte de um grupo seleto de compradores inteligentes.'
              },
              {
                icon: Sparkles,
                title: 'Notificações Instantâneas',
                description: 'Receba avisos por email quando os dias especiais começarem.'
              },
              {
                icon: TrendingUp,
                title: 'Economia Real',
                description: 'Sistema pensado para você economizar de verdade em suas compras.'
              },
              {
                icon: Gift,
                title: 'Variedade de Cupons',
                description: 'Diferentes tipos de cupons para todos os perfis de comprador.'
              }
            ].map((vantagem, index) => {
              const Icon = vantagem.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <Icon className="text-primary-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{vantagem.title}</h3>
                  <p className="text-gray-600">{vantagem.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-cupom-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Pronto para Começar a Economizar?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Junte-se a milhares de pessoas que já descobriram o poder dos cupons especiais
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated() && isUser() ? (
              <Link
                to="/comprar-cupons"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white text-primary-600 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <Gift className="mr-2" size={24} />
                Comprar Meu Primeiro Cupom
              </Link>
            ) : (
              <>
                <Link
                  to="/registro"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white text-primary-600 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Users className="mr-2" size={24} />
                  Criar Conta Grátis
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium border-2 border-white text-white hover:bg-white hover:text-primary-600 rounded-xl transition-all duration-300"
                >
                  Já tenho conta
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
