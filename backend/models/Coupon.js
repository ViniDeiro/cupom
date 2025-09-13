const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [6, 20]
    }
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  tipo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tipos_cupons',
      key: 'id'
    }
  },
  valor_pago: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  desconto_percentual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100
    }
  },
  data_compra: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  data_validade: {
    type: DataTypes.DATE,
    allowNull: false
  },
  usado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data_uso: {
    type: DataTypes.DATE
  },
  pedido_id: {
    type: DataTypes.UUID,
    references: {
      model: 'pedidos',
      key: 'id'
    }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status_pagamento: {
    type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado'),
    allowNull: true,
    defaultValue: 'pendente'
  },
  mercado_pago_payment_id: {
    type: DataTypes.STRING,
    allowNull: true
    // Removido unique: true para permitir múltiplos cupons com mesmo payment_id em testes
  }
}, {
  tableName: 'cupons',
  timestamps: true
});

// Método para gerar código único
Coupon.gerarCodigo = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CUP${codigo}`;
};

// Método para verificar se o cupom é válido
Coupon.prototype.isValido = function() {
  const agora = new Date();
  // Cupom é válido se não foi usado, está ativo (ou pagamento aprovado) e não expirou
  const statusValido = this.ativo || this.status_pagamento === 'aprovado';
  return !this.usado && 
         statusValido && 
         agora <= this.data_validade;
};

module.exports = Coupon;
