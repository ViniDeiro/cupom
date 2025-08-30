import React, { useState, useEffect } from 'react';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

function AdminSpecialDays() {
  const [specialDays, setSpecialDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);

  useEffect(() => {
    fetchSpecialDays();
  }, []);

  const fetchSpecialDays = async () => {
    try {
      // Simulação de dias especiais para preview
      setTimeout(() => {
        setSpecialDays([
          {
            id: 1,
            name: 'Black Friday',
            date: '2024-11-29',
            discountPercentage: 50,
            description: 'Mega promoção de Black Friday com até 50% de desconto',
            active: true
          },
          {
            id: 2,
            name: 'Dia das Mães',
            date: '2024-05-12',
            discountPercentage: 30,
            description: 'Promoção especial para o Dia das Mães',
            active: false
          },
          {
            id: 3,
            name: 'Natal',
            date: '2024-12-25',
            discountPercentage: 40,
            description: 'Promoção natalina com descontos especiais',
            active: true
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar dias especiais:', error);
      toast.error('Erro ao carregar dias especiais');
      setLoading(false);
    }
  };

  const handleEdit = (day) => {
    setEditingDay(day);
    setShowModal(true);
  };

  const handleDelete = (dayId) => {
    if (window.confirm('Tem certeza que deseja excluir este dia especial?')) {
      setSpecialDays(specialDays.filter(d => d.id !== dayId));
      toast.success('Dia especial excluído com sucesso!');
    }
  };

  const handleToggleStatus = (dayId) => {
    setSpecialDays(specialDays.map(d => 
      d.id === dayId ? { ...d, active: !d.active } : d
    ));
    toast.success('Status do dia especial atualizado!');
  };

  const isDatePassed = (date) => {
    return new Date(date) < new Date();
  };

  if (loading) {
    return <Loading text="Carregando dias especiais..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dias Especiais</h1>
        <button
          onClick={() => {
            setEditingDay(null);
            setShowModal(true);
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Novo Dia Especial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialDays.map((day) => (
          <div key={day.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{day.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleStatus(day.id)}
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    day.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {day.active ? 'Ativo' : 'Inativo'}
                </button>
                {isDatePassed(day.date) && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    Expirado
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">{day.description}</p>
              <p className="text-sm font-medium text-gray-900">
                Data: {new Date(day.date).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm font-medium text-primary-600">
                Desconto: {day.discountPercentage}%
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(day)}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(day.id)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {specialDays.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum dia especial cadastrado
          </h3>
          <p className="text-gray-600 mb-6">
            Crie dias especiais para oferecer promoções e descontos únicos aos seus clientes.
          </p>
          <button
            onClick={() => {
              setEditingDay(null);
              setShowModal(true);
            }}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Criar Primeiro Dia Especial
          </button>
        </div>
      )}

      {/* Modal seria implementado aqui */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">
              {editingDay ? 'Editar Dia Especial' : 'Novo Dia Especial'}
            </h3>
            <p className="text-gray-600 mb-4">
              Formulário de dia especial seria implementado aqui.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  toast.success('Dia especial salvo com sucesso!');
                }}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSpecialDays;