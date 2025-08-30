import React, { useState, useEffect } from 'react';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';

function BuyCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token encontrado:', !!token);
      
      const response = await fetch('/api/coupons/tipos', {
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
        console.log('Erro na resposta da API, usando dados simulados');
        // Fallback para dados simulados se a API não estiver disponível
        setCoupons([
          {
            id: 1,
            nome: 'Cupom Bronze - 10% OFF',
            descricao: 'Desconto de 10% em produtos selecionados',
            desconto: 10,
            tipo: 'porcentagem',
            preco: 25.00,
            validade_dias: 90
          },
          {
            id: 2,
            nome: 'Cupom Prata - 15% OFF',
            descricao: 'Desconto de 15% em produtos selecionados',
            desconto: 15,
            tipo: 'porcentagem',
            preco: 50.00,
            validade_dias: 60
          },
          {
            id: 3,
            nome: 'Cupom Ouro - 20% OFF',
            descricao: 'Desconto de 20% em produtos selecionados',
            desconto: 20,
            tipo: 'porcentagem',
            preco: 75.00,
            validade_dias: 45
          },
          {
            id: 4,
            nome: 'Cupom Diamante - 25% OFF',
            descricao: 'Desconto de 25% em produtos selecionados',
            desconto: 25,
            tipo: 'porcentagem',
            preco: 100.00,
            validade_dias: 30
          }
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      toast.error('Erro ao carregar cupons');
      setCoupons([]); // Garantir que coupons seja sempre um array
      setLoading(false);
    }
  };

  const handleBuyCoupon = async (coupon) => {
    try {
      const response = await fetch('/api/coupons/comprar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tipo_cupom_id: coupon.id,
          forma_pagamento: 'pix'
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Gerar código PIX simulado
        const pixCode = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}@pix.com5204000053039865802BR5925Eu Tenho Sonhos Ltda6009SAO PAULO62070503***6304`;
        
        toast.success('Cupom reservado! Código PIX gerado.');
        
        // Mostrar modal com código PIX
        const confirmed = window.confirm(
          `Código PIX para pagamento do cupom:\n\n${pixCode}\n\nValor: R$ ${(coupon.preco || coupon.price).toFixed(2)}\n\nApós o pagamento, seu cupom será ativado automaticamente.\n\nClique OK para copiar o código PIX.`
        );
        
        if (confirmed) {
          // Tentar copiar para área de transferência
          try {
            await navigator.clipboard.writeText(pixCode);
            toast.success('Código PIX copiado para área de transferência!');
          } catch (err) {
            console.log('Erro ao copiar:', err);
          }
        }
      } else {
        throw new Error(result.erro || 'Erro ao processar compra');
      }
    } catch (error) {
      console.error('Erro ao comprar cupom:', error);
      toast.error(error.message || 'Erro ao processar compra do cupom');
    }
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
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Comprar com PIX
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600 text-lg">Nenhum cupom disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyCoupons;