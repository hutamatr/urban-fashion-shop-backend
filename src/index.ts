import 'dotenv/config';

import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import ProductRouter from './routes/product';

const port = process.env.PORT;
const host = process.env.HOST;

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/products', ProductRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at ${host}${port}`);
});
