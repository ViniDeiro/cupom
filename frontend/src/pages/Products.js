import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { productsAPI, couponsAPI } from '../services/apiUtils';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const Products = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    categoria: '',
    busca: '',
    page: 1,
    limit: 12
  });
  const [showFilters, setShowFilters] = useState(false);

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

  // Buscar produtos
  const { data: productsData, isLoading, error } = useQuery(
    ['products', filters],
    () => productsAPI.getProducts(filters),
    {
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true
    }
  );

  // Buscar categorias
  const { data: categoriesData } = useQuery(
    'categories',
    productsAPI.getCategories,
    {
      staleTime: 30 * 60 * 1000
    }
  );

  const isSpecialDay = specialDayData?.data?.dia_especial;
  const specialDayInfo = specialDayData?.data?.evento;
  const products = productsData?.data?.produtos || [];
  const pagination = productsData?.data?.paginacao || {};
  const categories = categoriesData?.data?.categorias || [];

  // Atualizar página no localStorage para persitir estado
  useEffect(() => {
    const savedFilters = localStorage.getItem('productFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar filtros salvos:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('productFilters', JSON.stringify(filters));
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Resetar página ao filtrar
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const busca = formData.get('busca');
    handleFilterChange('busca', busca);
  };

  const handleAddToCart = (produto) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item.produto.id === produto.id);
      
      if (existingItem) {
        existingItem.quantidade += 1;
        toast.success(`${produto.nome} (${existingItem.quantidade}x) adicionado ao carrinho!`);
      } else {
        cart.push({ produto, quantidade: 1 });
        toast.success(`${produto.nome} adicionado ao carrinho!`);
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      toast.error('Erro ao adicionar produto ao carrinho');
    }
  };

  const clearFilters = () => {
    setFilters({
      categoria: '',
      busca: '',
      page: 1,
      limit: 12
    });
    localStorage.removeItem('productFilters');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar produtos</h2>
          <p className="text-gray-600 mb-4">Tente novamente em alguns instantes</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da página */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Nossos Produtos
              </h1>
              <p className="text-gray-600">
                {isSpecialDay ? (
                  <>
                    🎉 <strong>{specialDayInfo?.nome}</strong> ativo! Use seus cupons agora!
                  </>
                ) : (
                  'Descubra produtos incríveis. Alguns ficam disponíveis apenas em dias especiais!'
                )}
              </p>
            </div>

            {/* Busca */}
            <div className="flex-1 max-w-lg lg:ml-8">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="busca"
                    type="text"
                    placeholder="Buscar produtos..."
                    defaultValue={filters.busca}
                    className="input-field pl-10 pr-4"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary ml-2"
                >
                  Buscar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros */}
          <div className="lg:w-64">
            <div className="lg:sticky lg:top-8">
              {/* Botão mobile para mostrar filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full btn-secondary mb-4 flex items-center justify-center"
              >
                <SlidersHorizontal size={16} className="mr-2" />
                Filtros
              </button>

              {/* Filtros */}
              <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                  {(filters.categoria || filters.busca) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Categoria */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Categoria
                  </label>
                  <select
                    value={filters.categoria}
                    onChange={(e) => handleFilterChange('categoria', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(categoria => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estatísticas */}
                {pagination.total > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Estatísticas</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{pagination.total} produtos encontrados</p>
                      <p>Página {pagination.page} de {pagination.pages}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de produtos */}
          <div className="flex-1">
            {/* Controles da listagem */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {pagination.total || 0} produtos
                </span>
                {(filters.categoria || filters.busca) && (
                  <div className="flex items-center space-x-2">
                    {filters.categoria && (
                      <span className="badge bg-primary-100 text-primary-800">
                        {filters.categoria}
                        <button
                          onClick={() => handleFilterChange('categoria', '')}
                          className="ml-1 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.busca && (
                      <span className="badge bg-primary-100 text-primary-800">
                        "{filters.busca}"
                        <button
                          onClick={() => handleFilterChange('busca', '')}
                          className="ml-1 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Modo de visualização */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <Loading text="Carregando produtos..." />
            )}

            {/* Lista de produtos */}
            {!isLoading && products.length > 0 && (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
                }>
                  {products.map(produto => (
                    <ProductCard
                      key={produto.id}
                      produto={produto}
                      onAddToCart={handleAddToCart}
                      isSpecialDay={isSpecialDay}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Paginação */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12">
                    <button
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                      disabled={filters.page <= 1}
                      className="btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      const pageNum = Math.max(1, filters.page - 2) + i;
                      if (pageNum > pagination.pages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleFilterChange('page', pageNum)}
                          className={`px-3 py-2 rounded-lg ${
                            pageNum === filters.page 
                              ? 'bg-primary-600 text-white' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                      disabled={filters.page >= pagination.pages}
                      className="btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Nenhum produto encontrado */}
            {!isLoading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Tente ajustar os filtros ou buscar por outros termos
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Ver todos os produtos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
