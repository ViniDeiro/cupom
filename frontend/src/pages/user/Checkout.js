import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Edit2, Plus, Minus, ShoppingCart, ArrowLeft, Mail } from 'lucide-react';
import PaymentForm from '../../components/PaymentForm';

function Checkout() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zipCode: '',
    addressNumber: '',
    state: 'SP', // Valor padrão para o estado
    couponCode: '',
    complement: '',
    observations: ''
  });
  const [currentStep, setCurrentStep] = useState('address'); // 'address', 'payment'
  const [orderId, setOrderId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isOnlyCupons, setIsOnlyCupons] = useState(false);
  
  // Carregar itens do carrinho do localStorage
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Verificar se o carrinho está vazio
        if (cart.length === 0) {
          toast.error('Seu carrinho está vazio');
          navigate('/produtos');
          return;
        }
        
        // Transformar formato do carrinho para o formato usado no checkout
        const formattedItems = cart.map(item => ({
          id: item.produto.id,
          name: item.produto.nome,
          price: item.produto.preco,
          quantity: item.quantidade,
          image: item.produto.imagem,
          produto: item.produto // Manter referência ao produto original
        }));
        
        setCartItems(formattedItems);
        
        // Verificar se todos os produtos são cupons
        const allCupons = formattedItems.every(item => 
          item.produto.categoria && item.produto.categoria.toLowerCase().includes('cupom')
        );
        setIsOnlyCupons(allCupons);
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        toast.error('Erro ao carregar itens do carrinho');
        navigate('/produtos');
      }
    };
    
    loadCartItems();
  }, [navigate]);
  
  // Função para atualizar a quantidade de um item no carrinho
  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Atualizar no estado local
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      
      // Atualizar no localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = cart.map(item => 
        item.produto.id === itemId ? { ...item, quantidade: newQuantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Disparar evento para atualizar o contador do carrinho no Layout
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Quantidade atualizada');
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      toast.error('Erro ao atualizar quantidade');
    }
  };
  
  // Função para remover um item do carrinho
  const removeCartItem = (itemId) => {
    try {
      // Remover do estado local
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      
      // Remover do localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = cart.filter(item => item.produto.id !== itemId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Disparar evento para atualizar o contador do carrinho no Layout
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Item removido do carrinho');
      
      // Se o carrinho ficar vazio, redirecionar para a página de produtos
      if (updatedItems.length === 0) {
        toast.error('Seu carrinho está vazio');
        navigate('/produtos');
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast.error('Erro ao remover item do carrinho');
    }
  };
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [freteOptions, setFreteOptions] = useState([]);
  const [selectedFrete, setSelectedFrete] = useState(null);
  const [freteLoading, setFreteLoading] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freteValue = isOnlyCupons ? 0 : (selectedFrete ? selectedFrete.valor : 0);
  const total = subtotal - discount + freteValue;

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

  const calcularFrete = async () => {
    if (!formData.zipCode || formData.zipCode.length < 8) {
      toast.error('Digite um CEP válido para calcular o frete');
      return;
    }

    setFreteLoading(true);
    try {
      // Peso estimado baseado nos itens do carrinho (exemplo: 0.5kg por item)
      const pesoTotal = cartItems.reduce((peso, item) => peso + (item.quantity * 0.5), 0);
      
      const response = await fetch('/api/correios/calcular-frete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cepOrigem: '01310100', // CEP da loja (pode vir das configurações)
          cepDestino: formData.zipCode.replace(/\D/g, ''),
          peso: Math.max(pesoTotal, 0.3), // Peso mínimo de 300g
          comprimento: 20,
          altura: 5,
          largura: 15,
          servicos: ['40010', '41106'] // SEDEX e PAC
        })
      });

      const result = await response.json();

      if (result.success && result.data.resultados.length > 0) {
        setFreteOptions(result.data.resultados);
        toast.success('Opções de frete calculadas!');
      } else {
        toast.error('Não foi possível calcular o frete para este CEP');
        setFreteOptions([]);
      }
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      toast.error('Erro ao calcular frete. Tente novamente.');
      setFreteOptions([]);
    } finally {
      setFreteLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar CEP no formato correto (00000-000)
      if (!isOnlyCupons && (!formData.zipCode || !/^\d{5}-\d{3}$/.test(formData.zipCode))) {
        throw new Error('CEP inválido. Use o formato 00000-000');
      }

      // Validar campos obrigatórios
      if (!isOnlyCupons) {
        if (!formData.address || !formData.city || !formData.addressNumber || !formData.state) {
          throw new Error('Preencha todos os campos obrigatórios do endereço');
        }
      }

      // Validar se há itens no carrinho
      if (cartItems.length === 0) {
        throw new Error('Seu carrinho está vazio');
      }

      // Validar se selecionou opção de frete quando necessário
      if (!isOnlyCupons && freteOptions.length > 0 && !selectedFrete) {
        throw new Error('Selecione uma opção de frete para continuar');
      }

      // Verificar se todos os campos obrigatórios estão presentes
      if (!isOnlyCupons && (!formData.state || formData.state.trim() === '')) {
        throw new Error('O campo Estado é obrigatório');
      }

      const orderData = {
        itens: cartItems.map(item => ({
          produto_id: item.id,
          quantidade: item.quantity,
          preco_unitario: item.price
        })),
        // Para cupons digitais, não precisamos de endereço
        endereco_entrega: isOnlyCupons ? null : {
          rua: formData.address || 'Entrega Digital',
          cidade: formData.city || 'Entrega Digital',
          cep: formData.zipCode || '01310-100',
          numero: formData.addressNumber || '123',
          estado: formData.state || 'SP',
          bairro: formData.neighborhood || 'Centro',
          complemento: formData.complement || ''
        },
        // Adicionar forma de pagamento (obrigatório para todos os pedidos)
        forma_pagamento: 'pix', // Simplificando para usar sempre pix, que é uma opção válida
        cupom_codigo: formData.couponCode || null,
        observacoes: formData.observations || '' // Usar o valor do campo de observações se existir
      };

      console.log('Dados sendo enviados:', JSON.stringify(orderData, null, 2));
      console.log('Cart items:', cartItems);
      console.log('Is only cupons:', isOnlyCupons);

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

      // Se forem apenas cupons, finalizar o pedido automaticamente
      if (isOnlyCupons) {
        // Limpar o carrinho após o pedido ser criado
        localStorage.setItem('cart', '[]');
        
        // Disparar evento para atualizar o contador do carrinho no Layout
        window.dispatchEvent(new Event('cartUpdated'));
        
        toast.success('Pedido de cupom processado com sucesso!');
        navigate('/meus-pedidos');
      } else {
        // Caso contrário, seguir para a etapa de pagamento
        setOrderId(result.id);
        setCurrentStep('payment');
        toast.success('Pedido criado! Agora escolha a forma de pagamento.');
      }
      
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error.message || 'Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    // Limpar o carrinho após o pagamento bem-sucedido
    localStorage.setItem('cart', '[]');
    
    // Disparar evento para atualizar o contador do carrinho no Layout
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast.success('Pagamento processado com sucesso!');
    navigate('/meus-pedidos');
  };

  const handlePaymentError = (error) => {
    console.error('Erro no pagamento:', error);
    toast.error('Erro no pagamento. Tente novamente.');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de checkout */}
        <div className="lg:col-span-2">
          {currentStep === 'address' && (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              {!isOnlyCupons ? (
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
                        required={!isOnlyCupons}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Rua, complemento"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número
                      </label>
                      <input
                        type="text"
                        name="addressNumber"
                        value={formData.addressNumber}
                        onChange={handleInputChange}
                        required={!isOnlyCupons}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="123"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        name="complement"
                        value={formData.complement}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Apartamento, bloco, etc. (opcional)"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required={!isOnlyCupons}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Sua cidade"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado
                        </label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required={!isOnlyCupons}
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          <option value="AC">Acre</option>
                          <option value="AL">Alagoas</option>
                          <option value="AP">Amapá</option>
                          <option value="AM">Amazonas</option>
                          <option value="BA">Bahia</option>
                          <option value="CE">Ceará</option>
                          <option value="DF">Distrito Federal</option>
                          <option value="ES">Espírito Santo</option>
                          <option value="GO">Goiás</option>
                          <option value="MA">Maranhão</option>
                          <option value="MT">Mato Grosso</option>
                          <option value="MS">Mato Grosso do Sul</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="PA">Pará</option>
                          <option value="PB">Paraíba</option>
                          <option value="PR">Paraná</option>
                          <option value="PE">Pernambuco</option>
                          <option value="PI">Piauí</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="RN">Rio Grande do Norte</option>
                          <option value="RS">Rio Grande do Sul</option>
                          <option value="RO">Rondônia</option>
                          <option value="RR">Roraima</option>
                          <option value="SC">Santa Catarina</option>
                          <option value="SP">São Paulo</option>
                          <option value="SE">Sergipe</option>
                          <option value="TO">Tocantins</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CEP
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={(e) => {
                                // Formatar o CEP automaticamente (00000-000)
                                const value = e.target.value.replace(/\D/g, '');
                                const formattedValue = value.length <= 5 
                                  ? value 
                                  : `${value.slice(0, 5)}-${value.slice(5, 8)}`;
                                setFormData(prev => ({
                                  ...prev,
                                  zipCode: formattedValue
                                }));
                              }}
                              required={!isOnlyCupons}
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              placeholder="00000-000"
                              maxLength="9"
                            />
                          <button
                            type="button"
                            onClick={calcularFrete}
                            disabled={freteLoading || !formData.zipCode}
                            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {freteLoading ? 'Calculando...' : 'Calcular Frete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-2 mb-4">
                  <Mail className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold">Entrega Digital</h2>
                </div>
                <p className="text-gray-600 mb-2">Seu pedido contém apenas cupons digitais.</p>
                <p className="text-gray-600 mb-2">Os cupons serão enviados para o seu e-mail cadastrado após a finalização do pedido.</p>
                <p className="text-green-600 font-medium">Não é necessário pagamento adicional para este tipo de pedido.</p>
              </div>
              )}

              {/* Opções de Frete */}
              {!isOnlyCupons && freteOptions.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Opções de Frete</h2>
                  
                  <div className="space-y-3">
                    {freteOptions.map((opcao, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedFrete?.codigo === opcao.codigo
                            ? 'border-primary-500 bg-primary-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedFrete(opcao)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="frete"
                                checked={selectedFrete?.codigo === opcao.codigo}
                                onChange={() => setSelectedFrete(opcao)}
                                className="text-primary-600 h-4 w-4 focus:ring-primary-500"
                              />
                              <span className="font-medium">{opcao.nomeServico}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Entrega em até {opcao.prazoEntrega} dia{opcao.prazoEntrega > 1 ? 's' : ''} útil{opcao.prazoEntrega > 1 ? 'eis' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-primary-600">
                              R$ {opcao.valor.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!selectedFrete && (
                    <p className="text-sm text-red-600 mt-2 font-medium">
                      Selecione uma opção de frete para continuar
                    </p>
                  )}
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cupom de Desconto</h2>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleInputChange}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Digite o código do cupom"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Aplicar
                  </button>
                </div>
                {discount > 0 && (
                  <div className="mt-3 p-3 bg-green-100 text-green-800 rounded-lg flex justify-between items-center">
                    <span className="font-medium">Cupom aplicado com sucesso!</span>
                    <span className="text-lg font-semibold">-R$ {discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Observações</h2>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Informações adicionais para entrega"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0 || (freteOptions.length > 0 && !selectedFrete && !isOnlyCupons)}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 mt-6 text-lg flex items-center justify-center"
              >
                {loading ? 'Processando...' : cartItems.length === 0 ? (
                  <>
                    <ShoppingCart size={20} className="mr-2" />
                    Carrinho Vazio
                  </>
                ) : isOnlyCupons ? 'Finalizar Pedido de Cupom' : 'Continuar para Pagamento'}
              </button>
            </form>
          )}

          {currentStep === 'payment' && orderId && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setCurrentStep('address')} 
                  className="flex items-center text-blue-500 hover:text-blue-700 transition-colors mr-4"
                >
                  <ArrowLeft size={20} className="mr-1" />
                  Voltar
                </button>
                <h2 className="text-xl font-semibold">Pagamento</h2>
              </div>
              
              <PaymentForm
                pedidoId={orderId}
                total={total}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          )}
        </div>

        {/* Resumo do pedido */}
        <div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Resumo do Pedido</h2>
              <Link to="/produtos" className="flex items-center text-blue-500 hover:text-blue-700 text-sm">
                <ArrowLeft size={16} className="mr-1" />
                Continuar comprando
              </Link>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center">
                <ShoppingCart size={48} className="text-gray-400 mb-4" />
                <p className="text-gray-500">Seu carrinho está vazio</p>
                <button
                  onClick={() => navigate('/produtos')}
                  className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors"
                >
                  Explorar Produtos
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-2 border-b pb-2">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500 mb-2">Preço unitário: R$ {item.price.toFixed(2)}</p>
                      <div className="flex items-center">
                        <button 
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="mx-3 font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={16} />
                        </button>
                        <button 
                          onClick={() => removeCartItem(item.id)}
                          className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <span className="font-medium text-right mt-2 sm:mt-0">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            
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
              
              {!isOnlyCupons && selectedFrete && (
                <div className="flex justify-between">
                  <span>Frete ({selectedFrete.nomeServico}):</span>
                  <span>R$ {selectedFrete.valor.toFixed(2)}</span>
                </div>
              )}
              
              {isOnlyCupons && (
                <div className="flex justify-between text-green-600">
                  <span>Frete:</span>
                  <span>Grátis (Entrega Digital)</span>
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
                disabled={loading || (freteOptions.length > 0 && !selectedFrete && !isOnlyCupons)}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? 'Processando...' : isOnlyCupons ? 'Finalizar Pedido de Cupom' : 'Continuar para Pagamento'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;