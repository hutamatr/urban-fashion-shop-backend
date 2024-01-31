import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { domain, userRes } from '../test-utils/test.utils';
import app from '../../../app';
import { sequelize } from '../../../database/db';

let cookie;

describe('Refresh Token Test Cases', () => {
  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const cerateUserAcc = await userRes();
    cookie = cerateUserAcc.headers['set-cookie'];
  });

  test('should return 200 status code when refresh token is valid and send new access token', async () => {
    const res = await request(app)
      .get(`${domain}/refresh`)
      .set('cookie', cookie)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('access_token');
  });

  // After all tests have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
