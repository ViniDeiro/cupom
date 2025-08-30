import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-cupom-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Ilustração 404 */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary-200 mb-4">404</div>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-cupom-500 mx-auto rounded-full"></div>
        </div>

        {/* Mensagem */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Página não encontrada
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Oops! A página que você está procurando não existe ou foi movida para outro lugar.
        </p>

        {/* Sugestões */}
        <div className="space-y-4 mb-8">
          <p className="text-sm text-gray-500">Você pode tentar:</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Home size={16} className="mr-2" />
              Voltar ao início
            </Link>
            <Link
              to="/produtos"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <Search size={16} className="mr-2" />
              Explorar produtos
            </Link>
          </div>
        </div>

        {/* Link para voltar */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Voltar à página anterior
        </button>

        {/* Links úteis */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Links úteis:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/" className="text-primary-600 hover:text-primary-700">
              Início
            </Link>
            <Link to="/produtos" className="text-primary-600 hover:text-primary-700">
              Produtos
            </Link>
            <Link to="/comprar-cupons" className="text-primary-600 hover:text-primary-700">
              Comprar Cupons
            </Link>
            <Link to="/sobre" className="text-primary-600 hover:text-primary-700">
              Sobre
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
