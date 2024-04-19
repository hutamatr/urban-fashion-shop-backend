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

let userToken;
let productId;

describe('Wishlist Test Cases', () => {
  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const createAdminAcc = await adminRes();
    const createUserAcc = await userRes();
    const createCategory = await categoryRes(createAdminAcc.body?.access_token);
    const createProduct = await productRes(
      createAdminAcc.body?.access_token,
      createCategory.body?.category?.id
    );
    userToken = createUserAcc.body?.access_token;
    productId = createProduct.body?.product?.id;
  });

  test('should return 201 status code when create new wishlist with valid data', async () => {
    const res = await request(app)
      .post(`${domain}/wishlists`)
      .send({
        product_id: productId,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(201);
  });

  test('should return 200 status code when get all wishlists', async () => {
    const res = await request(app)
      .get(`${domain}/wishlists`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when get one wishlist', async () => {
    const res = await request(app)
      .get(`${domain}/wishlists/${productId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when delete wishlist', async () => {
    const res = await request(app)
      .delete(`${domain}/wishlists/${productId}`)
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
