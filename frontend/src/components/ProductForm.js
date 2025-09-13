import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/apiUtils';

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    preco_desconto: '',
    categoria: '',
    estoque: '',
    disponivel_dias_especiais: false,
    ativo: true
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Se estiver editando, preencher o formulário com os dados do produto
    if (product) {
      setFormData({
        nome: product.name || '',
        descricao: product.description || '',
        preco: product.price || '',
        preco_desconto: product.discountPrice || '',
        categoria: product.category || '',
        estoque: product.stock || '',
        disponivel_dias_especiais: product.specialDayOnly || false,
        ativo: product.active !== false
      });
    }

    // Carregar categorias
    fetchCategories();
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      if (response.data && response.data.categorias) {
        setCategories(response.data.categorias);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Converter valores numéricos
    const processedData = {
      ...formData,
      preco: parseFloat(formData.preco),
      preco_desconto: formData.preco_desconto ? parseFloat(formData.preco_desconto) : null,
      estoque: parseInt(formData.estoque, 10)
    };
    
    onSave(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          required
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        ></textarea>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
          <input
            type="number"
            name="preco"
            value={formData.preco}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Preço com Desconto (R$)</label>
          <input
            type="number"
            name="preco_desconto"
            value={formData.preco_desconto}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoria</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
            <option value="nova">+ Nova Categoria</option>
          </select>
          
          {formData.categoria === 'nova' && (
            <input
              type="text"
              name="nova_categoria"
              placeholder="Digite a nova categoria"
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
            />
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Estoque</label>
          <input
            type="number"
            name="estoque"
            value={formData.estoque}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="disponivel_dias_especiais"
            name="disponivel_dias_especiais"
            checked={formData.disponivel_dias_especiais}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="disponivel_dias_especiais" className="ml-2 block text-sm text-gray-700">
            Disponível apenas em dias especiais
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="ativo"
            name="ativo"
            checked={formData.ativo}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="ativo" className="ml-2 block text-sm text-gray-700">
            Produto ativo
          </label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;