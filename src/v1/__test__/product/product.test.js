import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import path from 'path';
import request from 'supertest';

import { adminRes, categoryRes, domain } from '../test-utils/test.utils';
import app from '../../../app';
import { sequelize } from '../../../database/db';

let adminToken;
let categoryId;
let productId;

describe('Product Test Cases', () => {
  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const createAdminAcc = await adminRes();
    adminToken = createAdminAcc.body?.access_token;

    const createCategory = await categoryRes(adminToken);
    categoryId = createCategory.body.category.id;
  });

  test('should return 201 status code when create new product with valid data', async () => {
    const res = await request(app)
      .post(`${domain}/products`)
      .field('title', faker.commerce.productName())
      .field('description', faker.commerce.productDescription())
      .field(
        'price',
        faker.commerce.price({
          min: 10000,
          max: 100000,
        })
      )
      .field('stock_quantity', '100')
      .field(
        'discount_percentage',
        faker.number.int({ min: 0, max: 100 }).toString()
      )
      .field('category_id', categoryId?.toString())
      .attach('image_url', path.resolve(__dirname, './product1.jpg'))
      .set('Content-Type', 'multipart/form-data')
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(201);
    productId = res.body.product.id;
  });

  test('should return 200 status code when get all products', async () => {
    const res = await request(app)
      .get(`${domain}/products`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when get one product', async () => {
    const res = await request(app)
      .get(`${domain}/products/${productId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
  });

  test('should return 201 status code when update product with valid data', async () => {
    const res = await request(app)
      .put(`${domain}/products/${productId}`)
      .send({
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price({
          min: 10000,
          max: 100000,
        }),
        stock_quantity: faker.number.int({ min: 0, max: 100 }).toString(),
        discount_percentage: faker.number.int({ min: 0, max: 100 }).toString(),
        category_id: categoryId?.toString(),
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(201);
  });

  test('should return 200 status code when delete product', async () => {
    const res = await request(app)
      .delete(`${domain}/products/${productId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 404 status code if product want to delete not found', async () => {
    const res = await request(app)
      .get(`${domain}/products/${productId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(404);
  });

  // After all tests have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
