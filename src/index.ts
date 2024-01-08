import 'dotenv/config';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import multer from 'multer';

import { sequelize } from './database/db';
import errorMiddleware from './middleware/error';
import { host, port } from './utils/constants';
import corsMiddleware from './utils/cors';
import errorHandler from './utils/error-handler';
import logger from './utils/logger';
import limiter from './utils/rate-limiter';
import Cart from './v1/models/cart.model';
import CartItem from './v1/models/cart-item.model';
import Category from './v1/models/category.model';
import Product from './v1/models/product.model';
import ResetPassword from './v1/models/reset-password.model';
import Role from './v1/models/role.model';
import Transaction from './v1/models/transaction.model';
import TransactionItem from './v1/models/transaction-item.model';
import User from './v1/models/user.model';
import Wishlist from './v1/models/wishlist.model';
import authRoutes from './v1/routes/auth.routes';
import cartRoutes from './v1/routes/cart.routes';
import categoryRoutes from './v1/routes/category.routes';
import productRoutes from './v1/routes/product.routes';
import refreshRoutes from './v1/routes/refresh.routes';
import roleRoutes from './v1/routes/role.routes';
import transactionRoutes from './v1/routes/transaction.routes';
import userRoutes from './v1/routes/user.routes';
import wishlistRoutes from './v1/routes/wishlist.routes';

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(upload.single('image_url'));
app.use(corsMiddleware());
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(logger());
app.use(limiter);

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/wishlists', wishlistRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1/refresh', refreshRoutes);

app.all('*', (_req: Request, _res: Response, next: NextFunction) => {
  try {
    const error: IError = new Error('Not Found!');
    error.statusCode = 404;
    throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, '404 Not Found!', next);
  }
});

app.use(errorMiddleware);

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

sequelize
  // .sync({ force: true })
  .sync()
  .then((_result) => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on ${host}:${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
