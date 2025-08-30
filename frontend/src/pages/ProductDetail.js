import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      // Simulação de produto para preview
      setTimeout(() => {
        setProduct({
          id: id,
          name: 'Produto Exemplo',
          description: 'Descrição detalhada do produto exemplo.',
          price: 99.99,
          image: 'https://via.placeholder.com/400x300',
          category: 'Categoria Exemplo',
          stock: 10
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar produto');
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Faça login para adicionar ao carrinho');
      navigate('/login');
      return;
    }
    
    toast.success('Produto adicionado ao carrinho!');
  };

  if (loading) {
    return <Loading text="Carregando produto..." />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h2>
          <button
            onClick={() => navigate('/produtos')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Voltar aos produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagem do produto */}
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Detalhes do produto */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          
          <div className="mb-4">
            <span className="text-sm text-gray-500">Categoria: </span>
            <span className="text-sm font-medium">{product.category}</span>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-bold text-primary-600">
              R$ {product.price.toFixed(2)}
            </span>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 w-20"
            >
              {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500 ml-2">
              ({product.stock} disponíveis)
            </span>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Adicionar ao Carrinho
            </button>
            
            <button
              onClick={() => navigate('/produtos')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Voltar aos Produtos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;