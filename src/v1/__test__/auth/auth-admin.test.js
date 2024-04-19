import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import app from '../../../app';
import { sequelize } from '../../../database/db';
import { adminCode } from '../../../utils/constants';

const domain = '/api/v1';
const email = faker.internet.email();
const password = 'Admin123!';
const confirmPassword = password;

describe('Auth Admin Test Cases', () => {
  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  test('should return 201 status code when signup admin with valid credentials', async () => {
    const res = await request(app)
      .post(`${domain}/admin/signup`)
      .send({
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        adminCode: adminCode,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(201);
    expect(res.body.access_token).not.toBeNull();
  });

  test('should return 200 status code when signin admin with valid credentials', async () => {
    const res = await request(app)
      .post(`${domain}/admin/signin`)
      .send({
        email: email,
        password: password,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.access_token).not.toBeNull();
  });

  // After all tests have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
