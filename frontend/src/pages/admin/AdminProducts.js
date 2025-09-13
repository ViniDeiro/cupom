import React, { useState, useEffect } from 'react';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { productsAPI } from '../../services/apiUtils';
import ProductForm from '../../components/ProductForm';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Buscando produtos da API...');
      
      const response = await productsAPI.getAllProducts();
      console.log('Resposta da API de produtos:', response.data);
      
      if (response.data && response.data.produtos) {
        // Mapear os dados para o formato esperado pelo componente
        const mappedProducts = response.data.produtos.map(produto => ({
          id: produto.id,
          name: produto.nome,
          description: produto.descricao,
          price: produto.preco,
          stock: produto.estoque,
          category: produto.categoria,
          active: produto.ativo !== false // Considera ativo se não especificado
        }));
        
        setProducts(mappedProducts);
        console.log('Produtos carregados:', mappedProducts.length);
      } else {
        console.warn('Formato de resposta inesperado:', response.data);
        setProducts([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos: ' + (error.response?.data?.erro || error.message));
      setProducts([]);
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productsAPI.deleteProduct(productId);
        await fetchProducts(); // Recarregar a lista após excluir
        toast.success('Produto excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        toast.error('Erro ao excluir produto: ' + (error.response?.data?.erro || error.message));
      }
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      const newStatus = !product.active;
      await productsAPI.updateProduct(productId, { ativo: newStatus });
      await fetchProducts(); // Recarregar a lista após atualizar
      toast.success('Status do produto atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status do produto:', error);
      toast.error('Erro ao atualizar status: ' + (error.response?.data?.erro || error.message));
    }
  };

  if (loading) {
    return <Loading text="Carregando produtos..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Produtos</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estoque
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  R$ {product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(product.id)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de criação/edição de produto */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <ProductForm 
              product={editingProduct} 
              onSave={async (productData) => {
                try {
                  setLoading(true);
                  if (editingProduct) {
                    await productsAPI.updateProduct(editingProduct.id, productData);
                    toast.success('Produto atualizado com sucesso!');
                  } else {
                    await productsAPI.createProduct(productData);
                    toast.success('Produto criado com sucesso!');
                  }
                  await fetchProducts(); // Recarregar a lista após salvar
                  setShowModal(false);
                } catch (error) {
                  console.error('Erro ao salvar produto:', error);
                  toast.error('Erro ao salvar produto: ' + (error.response?.data?.erro || error.message));
                } finally {
                  setLoading(false);
                }
              }}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;