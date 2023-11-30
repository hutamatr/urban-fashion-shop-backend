import 'dotenv/config';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';

import { sequelize } from './database/db';
import errorMiddleware from './middleware/error';
import corsMiddleware, { host, port } from './utils/cors';
import logger from './utils/logger';
import limiter from './utils/rate-limiter';
import productRoutes from './v1/routes/productRoutes';

const app = express();

app.use(bodyParser.json());
app.use(corsMiddleware());
app.use(cookieParser());
app.use(helmet());
app.use(logger());
app.use(limiter);

app.use('/api/v1/products', productRoutes);

app.all('*', (req, res) => {
  const statusCode = 404;
  res.status(statusCode);
  if (req.accepts('json')) {
    res.json({ error: true, statusCode, message: ['Not Found'] });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorMiddleware);

sequelize
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
