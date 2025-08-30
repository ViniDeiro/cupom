const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpecialDay = sequelize.define('SpecialDay', {
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
      len: [2, 100]
    }
  },
  descricao: {
    type: DataTypes.TEXT
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  data_fim: {
    type: DataTypes.DATE,
    allowNull: false
  },
  desconto_geral: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Desconto adicional aplicado em toda a loja'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  criado_por: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'administradores',
      key: 'id'
    }
  }
}, {
  tableName: 'dias_especiais',
  timestamps: true
});

// Método para verificar se está em período ativo
SpecialDay.prototype.isAtivo = function() {
  const agora = new Date();
  return this.ativo && 
         agora >= this.data_inicio && 
         agora <= this.data_fim;
};

// Método estático para verificar se hoje é um dia especial
SpecialDay.isHojeDiaEspecial = async function() {
  const agora = new Date();
  const diaEspecial = await SpecialDay.findOne({
    where: {
      ativo: true,
      data_inicio: { [sequelize.Sequelize.Op.lte]: agora },
      data_fim: { [sequelize.Sequelize.Op.gte]: agora }
    }
  });
  return diaEspecial;
};

module.exports = SpecialDay;
