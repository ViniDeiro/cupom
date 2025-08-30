import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, DollarSign, Percent, Calendar } from 'lucide-react';

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    desconto: '',
    preco: '',
    validade_dias: '90'
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCouponTypes();
      setCoupons(response.data);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      toast.error('Erro ao carregar tipos de cupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dados = {
        ...formData,
        desconto: parseInt(formData.desconto),
        preco: parseFloat(formData.preco),
        validade_dias: parseInt(formData.validade_dias)
      };

      if (editingCoupon) {
        await adminAPI.updateCouponType(editingCoupon.id, dados);
        toast.success('Tipo de cupom atualizado com sucesso!');
      } else {
        await adminAPI.createCouponType(dados);
        toast.success('Tipo de cupom criado com sucesso!');
      }

      setShowModal(false);
      setEditingCoupon(null);
      setFormData({
        nome: '',
        descricao: '',
        desconto: '',
        preco: '',
        validade_dias: '90'
      });
      fetchCoupons();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      toast.error('Erro ao salvar tipo de cupom');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      nome: coupon.nome,
      descricao: coupon.descricao || '',
      desconto: coupon.desconto.toString(),
      preco: coupon.preco.toString(),
      validade_dias: coupon.validade_dias.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este tipo de cupom?')) {
      try {
        await adminAPI.deleteCouponType(id);
        toast.success('Tipo de cupom deletado com sucesso!');
        fetchCoupons();
      } catch (error) {
        console.error('Erro ao deletar cupom:', error);
        toast.error('Erro ao deletar tipo de cupom');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({
      nome: '',
      descricao: '',
      desconto: '',
      preco: '',
      validade_dias: '90'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Cupons</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Tipo de Cupom
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{coupon.nome}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{coupon.descricao}</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Percent size={16} className="text-green-600" />
                <span>{coupon.desconto}% de desconto</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <DollarSign size={16} className="text-blue-600" />
                <span>R$ {coupon.preco.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar size={16} className="text-purple-600" />
                <span>Válido por {coupon.validade_dias} dias</span>
              </div>
            </div>
            
            <div className="mt-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                coupon.ativo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {coupon.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCoupon ? 'Editar Tipo de Cupom' : 'Novo Tipo de Cupom'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desconto (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.desconto}
                    onChange={(e) => setFormData({ ...formData, desconto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validade (dias)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.validade_dias}
                  onChange={(e) => setFormData({ ...formData, validade_dias: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingCoupon ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;