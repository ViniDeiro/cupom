const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  nivel: {
    type: DataTypes.ENUM('super', 'admin'),
    defaultValue: 'admin'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'administradores',
  timestamps: true,
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.senha) {
        admin.senha = await bcrypt.hash(admin.senha, 12);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('senha')) {
        admin.senha = await bcrypt.hash(admin.senha, 12);
      }
    }
  }
});

// Método para verificar senha
Admin.prototype.verificarSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

// Método para obter dados públicos
Admin.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.senha;
  return values;
};

module.exports = Admin;
