const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  preco_desconto: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: 0
    }
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estoque: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  imagem: {
    type: DataTypes.STRING
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  disponivel_dias_especiais: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se o produto está disponível apenas em dias especiais'
  }
}, {
  tableName: 'produtos',
  timestamps: true
});

module.exports = Product;
