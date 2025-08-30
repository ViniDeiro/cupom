import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PaymentForm from '../../components/PaymentForm';

function Checkout() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zipCode: '',
    couponCode: ''
  });
  const [currentStep, setCurrentStep] = useState('address'); // 'address', 'payment'
  const [orderId, setOrderId] = useState(null);
  const [cartItems] = useState([
    { id: 1, name: 'Produto Exemplo', price: 99.99, quantity: 1 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyCoupon = () => {
    if (formData.couponCode === 'DESCONTO10') {
      setDiscount(subtotal * 0.1);
      toast.success('Cupom aplicado com sucesso!');
    } else if (formData.couponCode) {
      toast.error('Cupom inválido');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        itens: cartItems.map(item => ({
          produto_id: item.id,
          quantidade: item.quantity,
          preco_unitario: item.price
        })),
        endereco_entrega: {
          rua: formData.address,
          cidade: formData.city,
          cep: formData.zipCode,
          numero: '123', // Você pode adicionar este campo ao formulário
          estado: 'SP' // Você pode adicionar este campo ao formulário
        },
        cupom_codigo: formData.couponCode || null
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.erro || 'Erro ao processar pedido');
      }

      setOrderId(result.id);
      setCurrentStep('payment');
      toast.success('Pedido criado! Agora escolha a forma de pagamento.');
      
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error.message || 'Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    toast.success('Pagamento processado com sucesso!');
    navigate('/meus-pedidos');
  };

  const handlePaymentError = (error) => {
    console.error('Erro no pagamento:', error);
    toast.error('Erro no pagamento. Tente novamente.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de checkout */}
        <div>
          {currentStep === 'address' && (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Endereço de Entrega</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Rua, número, complemento"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cupom de Desconto</h2>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleInputChange}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Digite o código do cupom"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Continuar para Pagamento'}
              </button>
            </form>
          )}

          {currentStep === 'payment' && orderId && (
            <PaymentForm
              pedidoId={orderId}
              total={total}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}
        </div>

        {/* Resumo do pedido */}
        <div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto:</span>
                  <span>-R$ {discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
            
            {currentStep === 'address' && (
              <button
                onClick={handleAddressSubmit}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Continuar para Pagamento'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;