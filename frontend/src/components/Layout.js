import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Tag, 
  Home,
  Package,
  LogIn,
  UserPlus,
  LogOut,
  Gift,
  CreditCard,
  FileText,
  Settings,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { couponsAPI } from '../services/apiUtils';
import { useQuery } from 'react-query';

const Layout = () => {
  const { isAuthenticated, isUser, isAdmin, getCurrentUserName, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  // Verificar se é dia especial
  const { data: specialDayData } = useQuery(
    'specialDay',
    couponsAPI.checkSpecialDay,
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: false,
      onError: () => {} // Ignorar erros silenciosamente
    }
  );

  const isSpecialDay = specialDayData?.data?.dia_especial;
  const specialDayInfo = specialDayData?.data?.evento;

  // Carregar carrinho do localStorage e atualizar quando modificado
  useEffect(() => {
    const loadCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total, item) => total + item.quantidade, 0);
      setCartCount(count);
    };
    
    // Carregar inicialmente
    loadCart();
    
    // Adicionar event listener para atualizações do carrinho
    window.addEventListener('cartUpdated', loadCart);
    
    // Cleanup
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  // Fechar menu mobile quando rota mudar
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Links da navegação principal
  const navLinks = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/produtos', label: 'Produtos', icon: Package },
    { to: '/comprar-cupons', label: 'Cupons', icon: Tag },
    { to: '/rastreamento', label: 'Rastreamento', icon: Search },
    { to: '/sobre', label: 'Sobre', icon: FileText }
  ];

  // Links do usuário autenticado
  const userLinks = [
    { to: '/minha-conta', label: 'Minha Conta', icon: User },
    { to: '/meus-cupons', label: 'Meus Cupons', icon: Tag },
    { to: '/comprar-cupons', label: 'Comprar Cupons', icon: Gift },
    { to: '/meus-pedidos', label: 'Meus Pedidos', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Banner de dia especial */}
      {isSpecialDay && (
        <div className="bg-gradient-to-r from-cupom-500 to-primary-600 text-white py-2 px-4 text-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium animate-pulse">
              🎉 <strong>{specialDayInfo?.nome}</strong> - Use seus cupons agora! 
              {specialDayInfo?.desconto_adicional && (
                <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  +{specialDayInfo.desconto_adicional}% OFF
                </span>
              )}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-opacity-10 to-transparent animate-pulse"></div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-cupom-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                Eu Tenho Sonhos
              </span>
            </Link>

            {/* Navegação desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Ações do usuário */}
            <div className="flex items-center space-x-4">
              {/* Carrinho */}
              <Link 
                to="/checkout" 
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Menu do usuário desktop */}
              <div className="hidden md:flex items-center space-x-2">
                {isAuthenticated() ? (
                  <div className="relative group">
                    <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors">
                      <User size={16} />
                      <span>{getCurrentUserName()}</span>
                    </button>
                    
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        {isUser() && userLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.to}
                              to={link.to}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                            >
                              <Icon size={16} />
                              <span>{link.label}</span>
                            </Link>
                          );
                        })}
                        {isAdmin() && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                          >
                            <Settings size={16} />
                            <span>Painel Administrativo</span>
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut size={16} />
                          <span>Sair</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <LogIn size={16} />
                      <span>Entrar</span>
                    </Link>
                    <Link
                      to="/registro"
                      className="btn-primary text-sm"
                    >
                      <UserPlus size={16} />
                      <span className="ml-1">Cadastrar</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Botão menu mobile */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {/* Links principais */}
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <hr className="my-2" />

              {/* Links do usuário */}
              {isAuthenticated() ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-gray-900">
                    Olá, {getCurrentUserName()}!
                  </div>
                  
                  {isUser() && userLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                      >
                        <Icon size={16} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                  
                  {isAdmin() && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                    >
                      <Settings size={16} />
                      <span>Painel Administrativo</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut size={16} />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <LogIn size={16} />
                    <span>Entrar</span>
                  </Link>
                  <Link
                    to="/registro"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-primary-600 hover:bg-primary-50"
                  >
                    <UserPlus size={16} />
                    <span>Cadastrar</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo e descrição */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-cupom-500 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Eu Tenho Sonhos</span>
              </div>
              <p className="text-gray-400 text-sm">
                Realize seus sonhos com nossos cupons especiais! Compre antecipadamente e aproveite descontos exclusivos em dias especiais.
              </p>
            </div>

            {/* Links úteis */}
            <div>
              <h3 className="font-semibold mb-4">Links Úteis</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Início</Link></li>
                <li><Link to="/produtos" className="hover:text-white transition-colors">Produtos</Link></li>
                <li><Link to="/comprar-cupons" className="hover:text-white transition-colors">Comprar Cupons</Link></li>
                <li><Link to="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
              </ul>
            </div>

            {/* Conta */}
            <div>
              <h3 className="font-semibold mb-4">Minha Conta</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {isAuthenticated() ? (
                  <>
                    <li><Link to="/minha-conta" className="hover:text-white transition-colors">Dashboard</Link></li>
                    <li><Link to="/meus-cupons" className="hover:text-white transition-colors">Meus Cupons</Link></li>
                    <li><Link to="/meus-pedidos" className="hover:text-white transition-colors">Meus Pedidos</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-white transition-colors">Entrar</Link></li>
                    <li><Link to="/registro" className="hover:text-white transition-colors">Cadastrar</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Eu Tenho Sonhos. Todos os direitos reservados.
            </p>
            <div className="mt-4 md:mt-0">
              <Link to="/admin/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                Acesso Administrativo
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
