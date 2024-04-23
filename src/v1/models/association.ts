import Cart from './cart.model';
import CartItem from './cart-item.model';
import Category from './category.model';
import Product from './product.model';
import RefreshToken from './refresh-token.model';
import ResetPassword from './reset-password.model';
import Role from './role.model';
import Transaction from './transaction.model';
import TransactionItem from './transaction-item.model';
import User from './user.model';
import Wishlist from './wishlist.model';

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

  // RefreshToken & User Associations
  User.hasMany(RefreshToken, { foreignKey: 'user_id' });
  RefreshToken.belongsTo(User, { foreignKey: 'user_id' });
}
