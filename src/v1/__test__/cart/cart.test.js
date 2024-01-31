import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import {
  adminRes,
  categoryRes,
  domain,
  productRes,
  userRes,
} from '../test-utils/test.utils';
import app from '../../../app';
import { sequelize } from '../../../database/db';

let adminToken;
let userToken;
let categoryId;
let productId;
let stockQuantity;

describe('Cart Test Cases', () => {
  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const createAdminAcc = await adminRes();
    adminToken = createAdminAcc.body?.access_token;

    const createUserAcc = await userRes();
    userToken = createUserAcc.body?.access_token;

    const createCategory = await categoryRes(adminToken);
    categoryId = createCategory.body?.category?.id;

    const createProduct = await productRes(adminToken, categoryId);
    productId = createProduct.body?.product?.id;
    stockQuantity = createProduct.body?.product?.stock_quantity;
  });

  test('should return 201 status code when create new cart with valid data', async () => {
    const res = await request(app)
      .post(`${domain}/carts`)
      .send({
        product_id: productId,
        quantity: faker.number.int({ min: 1, max: stockQuantity }),
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(201);
  });

  test('should return 200 status code when get all carts', async () => {
    const res = await request(app)
      .get(`${domain}/carts`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when increase quantity of product in cart with valid data', async () => {
    const res = await request(app)
      .put(`${domain}/carts/${productId}`)
      .send({
        plus: 5,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when decrease quantity of product in cart with valid data', async () => {
    const res = await request(app)
      .put(`${domain}/carts/${productId}`)
      .send({
        minus: 2,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when delete cart', async () => {
    const res = await request(app)
      .delete(`${domain}/carts/${productId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  // After all tests have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
