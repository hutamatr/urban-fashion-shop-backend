import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import app from '../../../app';
import { sequelize } from '../../../database/db';

const domain = '/api/v1';
const email = faker.internet.email();
const password = 'Rahmanto123!';
const confirmPassword = password;
let token;
let userId;
let resetPasswordToken;

describe('Auth Test Cases', () => {
  // Before any tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  test('should return 201 status code when signup new user with valid data', async () => {
    const res = await request(app)
      .post(`${domain}/signup`)
      .send({
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(201);
    expect(res.body.access_token).not.toBeNull();
    token = res.body.access_token;
    userId = res.body.user.id;
  });

  test('should return 200 status code when password changed successfully', async () => {
    const res = await request(app)
      .post(`${domain}/change-password`)
      .send({
        current_password: password,
        new_password: 'newPassword123!',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Cookie', 'rt=' + token)
      .auth(token, { type: 'bearer' });
    expect(res.statusCode).toBe(200);
  });

  test('should return 204 status code when signout user', async () => {
    const res = await request(app)
      .post(`${domain}/signout`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(204);
  });

  test('should return 200 status code when signin user with valid data', async () => {
    const res = await request(app)
      .post(`${domain}/signin`)
      .send({
        email: email,
        password: 'newPassword123!',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
  });

  test('should return 403 status code when signup new user with invalid data', async () => {
    const res = await request(app)
      .post(`${domain}/signup`)
      .send({
        email: `test`,
        password: 'test',
        confirmPassword: 'test',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(403);
  });

  test('should return 403 status code when signup new user password not match with confirm password', async () => {
    const res = await request(app)
      .post(`${domain}/signup`)
      .send({
        email: email,
        password: password,
        confirmPassword: 'test',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(403);
  });

  test('should return 401 status code when signin user with wrong password', async () => {
    const res = await request(app)
      .post(`${domain}/signin`)
      .send({
        email: email,
        password: 'wrongPassword123!',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(401);
  });

  test('should return 200 status code when reset password link sent successfully', async () => {
    const res = await request(app)
      .post(`${domain}/reset-password`)
      .send({
        email: email,
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.token).not.toBeNull();
    resetPasswordToken = res.body.token;
  });

  test('should return 200 status code when reset password successfully', async () => {
    const res = await request(app)
      .post(`${domain}/reset-password/${userId}/${resetPasswordToken}`)
      .send({
        new_password: 'resetNewPassword123!',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
  });

  // After all tests have finished, close the DB connection
  afterAll(async () => {
    await sequelize.close();
  });
});
