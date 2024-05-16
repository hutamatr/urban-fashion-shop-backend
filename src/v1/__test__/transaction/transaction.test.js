import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import {
  adminRes,
  cartRes,
  categoryRes,
  domain,
  productRes,
  userRes,
} from '../test-utils/test.utils';
import app from '../../../app';
import { sequelize } from '../../../database/db';
import { PAID, PENDING_PAYMENT, SHIPPING } from '../../../utils/constants';

let adminToken;
let userToken;
let categoryId;
let productId;
let transactionId;

describe('Transaction Test Cases', () => {
  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const createAdminAcc = await adminRes();
    adminToken = createAdminAcc.body?.access_token;

    const createCategory = await categoryRes(adminToken);
    categoryId = createCategory.body?.category?.id;

    const createProduct = await productRes(adminToken, categoryId);
    productId = createProduct.body?.product.id;

    const createUserAcc = await userRes();
    userToken = createUserAcc.body?.access_token;

    await cartRes(userToken, productId);
  });

  test('should return 201 status code when create new transaction with valid data', async () => {
    const res = await request(app)
      .post(`${domain}/transactions`)
      .send({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        address: faker.location.streetAddress(),
        phone_number: faker.phone.number(),
        city: faker.location.city(),
        postal_code: faker.location.zipCode(),
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(201);
    transactionId = res.body?.transaction?.id;
  });

  test('should return 200 status code when get all transaction by user', async () => {
    const res = await request(app)
      .get(`${domain}/transactions/user`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when get one transaction by transactionId', async () => {
    const res = await request(app)
      .get(`${domain}/transactions/${transactionId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when get all transactions by status', async () => {
    const res = await request(app)
      .get(`${domain}/transactions?status=${PENDING_PAYMENT}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when update transaction status with valid data', async () => {
    const res = await request(app)
      .put(`${domain}/transactions/${transactionId}`)
      .send({
        status: PAID,
        shipping_status: SHIPPING,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when delete transaction', async () => {
    const res = await request(app)
      .delete(`${domain}/transactions/${transactionId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  // After all tests have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
