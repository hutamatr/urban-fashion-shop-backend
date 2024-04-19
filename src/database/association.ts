import Cart from '../v1/models/cart.model';
import CartItem from '../v1/models/cart-item.model';
import Category from '../v1/models/category.model';
import Product from '../v1/models/product.model';
import ResetPassword from '../v1/models/reset-password.model';
import Role from '../v1/models/role.model';
import Transaction from '../v1/models/transaction.model';
import TransactionItem from '../v1/models/transaction-item.model';
import User from '../v1/models/user.model';
import Wishlist from '../v1/models/wishlist.model';

export default function association() {
  // Category & Product Associations
  Category.hasMany(Product, { foreignKey: 'category_id' });
  Product.belongsTo(Category, { foreignKey: 'category_id' });

  // Cart & User Associations
  User.hasOne(Cart, { foreignKey: 'user_id' });
  Cart.belongsTo(User, { foreignKey: 'user_id' });

  // Cart & Product Associations
  Product.belongsToMany(Cart, { through: CartItem, foreignKey: 'product_id' });
  Cart.belongsToMany(Product, { through: CartItem, foreignKey: 'cart_id' });

  // Role & User Associations
  Role.hasOne(User, { foreignKey: 'role_id' });
  User.belongsTo(Role, { foreignKey: 'role_id' });

  // WIshlist & User Associations
  User.hasMany(Wishlist, { foreignKey: 'user_id' });
  Wishlist.belongsTo(User, { foreignKey: 'user_id' });

  // WIshlist & Product Associations
  Product.hasMany(Wishlist, { foreignKey: 'product_id' });
  Wishlist.belongsTo(Product, { foreignKey: 'product_id' });

  // ResetPassword & User Associations
  User.hasOne(ResetPassword, { foreignKey: 'user_id' });
  ResetPassword.belongsTo(User, { foreignKey: 'user_id' });

  // Transaction & User Associations
  Transaction.belongsTo(User, { foreignKey: 'user_id' });
  User.hasMany(Transaction, { foreignKey: 'user_id' });

  // Transaction & Product Associations
  Transaction.belongsToMany(Product, {
    through: TransactionItem,
    foreignKey: 'transaction_id',
  });
  Product.belongsToMany(Transaction, {
    through: TransactionItem,
    foreignKey: 'product_id',
  });
}
