import 'dotenv/config';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import multer from 'multer';

import errorMiddleware from './middleware/error';
import morganMiddleware from './middleware/log';
import corsMiddleware from './utils/cors';
import { credentials } from './utils/credentials';
import { CustomError } from './utils/custom-error';
import errorHandler from './utils/error-handler';
import limiter from './utils/rate-limiter';
import association from './v1/models/association';
import authRoutes from './v1/routes/auth.routes';
import cartRoutes from './v1/routes/cart.routes';
import categoryRoutes from './v1/routes/category.routes';
import productRoutes from './v1/routes/product.routes';
import refreshRoutes from './v1/routes/refresh.routes';
import transactionRoutes from './v1/routes/transaction.routes';
import userRoutes from './v1/routes/user.routes';
import wishlistRoutes from './v1/routes/wishlist.routes';

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(upload.single('image_url'));
app.use(credentials);
app.use(corsMiddleware());
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(morganMiddleware);
app.use(limiter);

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/wishlists', wishlistRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1/refresh', refreshRoutes);

app.all('*', (_req: Request, _res: Response, next: NextFunction) => {
  try {
    const error = new CustomError(404, 'Not Found!');
    throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    errorHandler(error, '404 Not Found!', next);
  }
});

app.use(errorMiddleware);

association();

export default app;
