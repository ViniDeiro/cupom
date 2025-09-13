const User = require('./User');
const Admin = require('./Admin');
const Product = require('./Product');
const Coupon = require('./Coupon');
const CouponType = require('./CouponType');
const SpecialDay = require('./SpecialDay');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Associações entre modelos

// User - Coupon (1:N)
User.hasMany(Coupon, { foreignKey: 'usuario_id', as: 'cupons' });
Coupon.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// User - Order (1:N)
User.hasMany(Order, { foreignKey: 'usuario_id', as: 'pedidos' });
Order.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// Admin - SpecialDay (1:N)
Admin.hasMany(SpecialDay, { foreignKey: 'criado_por', as: 'dias_especiais' });
SpecialDay.belongsTo(Admin, { foreignKey: 'criado_por', as: 'criador' });

// Order - Coupon (N:1)
Order.belongsTo(Coupon, { foreignKey: 'cupom_id', as: 'cupom' });
Coupon.hasMany(Order, { foreignKey: 'cupom_id', as: 'pedidos' });

// Order - OrderItem (1:N)
Order.hasMany(OrderItem, { foreignKey: 'pedido_id', as: 'itens' });
OrderItem.belongsTo(Order, { foreignKey: 'pedido_id', as: 'pedido' });

// Product - OrderItem (1:N)
Product.hasMany(OrderItem, { foreignKey: 'produto_id', as: 'itens_pedido' });
OrderItem.belongsTo(Product, { foreignKey: 'produto_id', as: 'produto' });

// CouponType - Coupon (1:N)
CouponType.hasMany(Coupon, { foreignKey: 'tipo_id', as: 'cupons' });
Coupon.belongsTo(CouponType, { foreignKey: 'tipo_id', as: 'tipo' });

module.exports = {
  User,
  Admin,
  Product,
  Coupon,
  CouponType,
  SpecialDay,
  Order,
  OrderItem
};
