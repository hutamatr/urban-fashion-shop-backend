import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { adminRes, domain } from '../test-utils/test.utils';
import app from '../../../app';
import { sequelize } from '../../../database/db';

let adminToken;
let categoryId;

describe('Category Test Cases', () => {
  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const createAdminAcc = await adminRes();

    adminToken = createAdminAcc.body?.access_token;
  });

  test('should return 201 status code when create new category with valid data', async () => {
    const res = await request(app)
      .post(`${domain}/categories`)
      .send({
        category_name: faker.internet.domainWord(),
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(201);
  });

  test('should return 200 status code when get all categories', async () => {
    const res = await request(app)
      .get(`${domain}/categories`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.categories.length).toBeGreaterThan(0);
    categoryId = res.body.categories[0].id;
  });

  test('should return 200 status code when get one category', async () => {
    const res = await request(app)
      .get(`${domain}/categories/${categoryId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when update one category', async () => {
    const res = await request(app)
      .put(`${domain}/categories/${categoryId}`)
      .send({
        category_name: faker.internet.displayName(),
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when delete one category', async () => {
    const res = await request(app)
      .delete(`${domain}/categories/${categoryId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 422 status code when get one category after delete one', async () => {
    const res = await request(app)
      .get(`${domain}/categories/${categoryId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(422);
  });

  // After all tests have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
