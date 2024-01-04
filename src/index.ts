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
import errorHandler from './utils/errorHandler';
import logger from './utils/logger';
import limiter from './utils/rateLimiter';
import CartItem from './v1/models/cartItemModel';
import Cart from './v1/models/cartModel';
import Category from './v1/models/categoryModel';
import Product from './v1/models/productModel';
import ResetPassword from './v1/models/resetPasswordModel';
import Role from './v1/models/roleModel';
import User from './v1/models/userModel';
import Wishlist from './v1/models/wishlistModel';
import authRoutes from './v1/routes/authRoutes';
import cartRoutes from './v1/routes/cartRoutes';
import categoryRoutes from './v1/routes/categoryRoutes';
import productRoutes from './v1/routes/productRoutes';
import refreshRoutes from './v1/routes/refreshRoutes';
import roleRoutes from './v1/routes/roleRoutes';
import userRoutes from './v1/routes/userRoutes';
import wishlistRoutes from './v1/routes/wishlistRoutes';

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
