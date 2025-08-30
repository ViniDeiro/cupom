const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  cupom_id: {
    type: DataTypes.UUID,
    references: {
      model: 'cupons',
      key: 'id'
    }
  },
  total_produtos: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  desconto_cupom: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total_final: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmado', 'preparando', 'enviado', 'entregue', 'cancelado'),
    defaultValue: 'pendente'
  },
  forma_pagamento: {
    type: DataTypes.ENUM('pix', 'cartao', 'boleto'),
    allowNull: false
  },
  endereco_entrega: {
    type: DataTypes.JSON,
    allowNull: false
  },
  observacoes: {
    type: DataTypes.TEXT
  },
  mercado_pago_preference_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mercado_pago_payment_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  data_pagamento: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'pedidos',
  timestamps: true
});

// Método para gerar número do pedido
Order.gerarNumero = function() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PED${timestamp.slice(-6)}${random}`;
};

module.exports = Order;
