import React from 'react';
import { ShoppingCart, Tag, Clock } from 'lucide-react';
import { formatCurrency } from '../services/apiUtils';

const ProductCard = ({ produto, onAddToCart, isSpecialDay = false }) => {
  const {
    id,
    nome,
    descricao,
    preco,
    preco_atual,
    categoria,
    estoque,
    imagem,
    disponivel_dias_especiais,
    em_promocao
  } = produto;

  const isOutOfStock = estoque === 0;
  const isSpecialProduct = disponivel_dias_especiais;
  const hasDiscount = em_promocao || (preco_atual < preco);

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Imagem do produto */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {imagem ? (
          <img 
            src={imagem} 
            alt={nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-center">
            <Tag size={48} className="mx-auto mb-2" />
            <p className="text-sm">Sem imagem</p>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {isSpecialProduct && (
            <span className="badge bg-cupom-100 text-cupom-800 flex items-center gap-1">
              <Clock size={12} />
              Especial
            </span>
          )}
          {hasDiscount && (
            <span className="badge bg-red-100 text-red-800">
              Promoção
            </span>
          )}
          {isOutOfStock && (
            <span className="badge bg-gray-100 text-gray-800">
              Esgotado
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Categoria */}
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
          {categoria}
        </p>

        {/* Nome */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {nome}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {descricao}
        </p>

        {/* Preço */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(preco_atual)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(preco)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(preco_atual)}
              </span>
            )}
          </div>
          
          {hasDiscount && (
            <div className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
              -{Math.round(((preco - preco_atual) / preco) * 100)}%
            </div>
          )}
        </div>

        {/* Estoque */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            Estoque: <span className={estoque > 10 ? 'text-green-600' : estoque > 0 ? 'text-yellow-600' : 'text-red-600'}>
              {estoque} unidades
            </span>
          </span>
        </div>

        {/* Botão de ação */}
        <button
          onClick={() => onAddToCart && onAddToCart(produto)}
          disabled={isOutOfStock || (isSpecialProduct && !isSpecialDay)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isOutOfStock || (isSpecialProduct && !isSpecialDay)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'btn-primary hover:shadow-md'
          }`}
        >
          <ShoppingCart size={16} />
          {isOutOfStock 
            ? 'Esgotado'
            : isSpecialProduct && !isSpecialDay 
              ? 'Apenas em dias especiais'
              : 'Adicionar ao carrinho'
          }
        </button>

        {/* Aviso para produtos especiais */}
        {isSpecialProduct && !isSpecialDay && (
          <p className="text-xs text-cupom-600 text-center mt-2">
            💎 Este produto está disponível apenas em dias especiais com cupons
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
