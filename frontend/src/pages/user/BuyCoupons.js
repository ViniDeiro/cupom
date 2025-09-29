import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading';
import PaymentMethodSelector from '../../components/PaymentMethodSelector';
import toast from 'react-hot-toast';

function BuyCoupons() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token encontrado:', !!token);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/coupons/tipos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos da API:', data);
        setCoupons(data);
      } else {
        console.error('Erro ao carregar cupons da API');
        toast.error('Erro ao carregar cupons disponíveis');
        setCoupons([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      toast.error('Erro ao carregar cupons');
      setCoupons([]);
      setLoading(false);
    }
  };

  const handleBuyCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (cupomData) => {
    setShowPayment(false);
    setSelectedCoupon(null);
    toast.success(`Cupom ${cupomData.codigo} comprado com sucesso!`);
    // Redirecionar para a página de cupons do usuário
    navigate('/user/my-coupons');
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    setSelectedCoupon(null);
  };

  if (loading) {
    return <Loading text="Carregando cupons disponíveis..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Comprar Cupons</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(coupons) && coupons.length > 0 ? (
          coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-lg shadow-md p-6 border">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {coupon.nome || coupon.name}
              </h3>
              <p className="text-gray-600 mb-4">{coupon.descricao || coupon.description}</p>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  R$ {(coupon.preco || coupon.price).toFixed(2)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                <p>Válido por {coupon.validade_dias || coupon.validDays} dias</p>
                <p>
                  {(coupon.tipo === 'porcentagem' || coupon.type === 'percentage')
                    ? `${coupon.desconto || coupon.discount}% de desconto`
                    : `R$ ${(coupon.desconto || coupon.discount).toFixed(2)} de desconto`}
                </p>
              </div>
              
              <button
                onClick={() => handleBuyCoupon(coupon)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Comprar Cupom
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600 text-lg">Nenhum cupom disponível no momento.</p>
          </div>
        )}
      </div>

      {/* Modal de Pagamento */}
      {showPayment && selectedCoupon && (
        <PaymentMethodSelector
          couponType={selectedCoupon}
          onClose={handleClosePayment}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default BuyCoupons;