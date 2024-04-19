import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { adminRes, domain, userRes } from '../test-utils/test.utils';
import app from '../../../app';
import { sequelize } from '../../../database/db';

let adminToken;
let userToken;
let userId;

describe('User Test Cases', () => {
  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const createAdminAcc = await adminRes();
    const createUserAcc = await userRes();

    adminToken = createAdminAcc.body?.access_token;
    userToken = createUserAcc.body?.access_token;
    userId = createUserAcc.body?.user?.id;
  });

  test('should return 200 status code when get user profile', async () => {
    const res = await request(app)
      .get(`${domain}/users/${userId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when get all users data', async () => {
    const res = await request(app)
      .get(`${domain}/users`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(adminToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when update user profile', async () => {
    const res = await request(app)
      .put(`${domain}/users`)
      .send({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        address: faker.location.streetAddress(),
        phone_number: faker.phone.number(),
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(userToken, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code when delete user profile', async () => {
    const res = await request(app)
      .delete(`${domain}/users/${userId}`)
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
