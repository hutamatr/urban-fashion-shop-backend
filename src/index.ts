import 'dotenv/config';

import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { sequelize } from './database/db';
import errorMiddleware, { IError } from './middleware/error';
import corsMiddleware, { host, port } from './utils/cors';
import errorHandler from './utils/errorHandler';
import logger from './utils/logger';
import limiter from './utils/rateLimiter';
import CartItem from './v1/models/cartItemModel';
import Cart from './v1/models/cartModel';
import Category from './v1/models/categoryModel';
import Product from './v1/models/productModel';
import Role from './v1/models/roleModel';
import User from './v1/models/userModel';
import authRoutes from './v1/routes/authRoutes';
import cartRoutes from './v1/routes/cartRoutes';
import categoryRoutes from './v1/routes/categoryRoutes';
import productRoutes from './v1/routes/productRoutes';
import roleRoutes from './v1/routes/roleRoutes';

const app = express();

app.use(bodyParser.json());
app.use(corsMiddleware());
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(logger());
app.use(limiter);

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1', authRoutes);

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
