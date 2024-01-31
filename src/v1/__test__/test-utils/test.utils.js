import { faker } from '@faker-js/faker';
import path from 'path';
import request from 'supertest';

import app from '../../../app';
import { adminCode } from '../../../utils/constants';

export const domain = '/api/v1';
export const emailAdmin = faker.internet.email({ firstName: 'admin' });
export const emailUser = faker.internet.email({ firstName: 'user' });
export const password = 'Password123!';
export const confirmPassword = password;

export async function adminRes() {
  const res = await request(app)
    .post(`${domain}/admin/signup`)
    .send({
      email: emailAdmin,
      password: password,
      confirmPassword: confirmPassword,
      adminCode: adminCode,
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
  return res;
}

export async function userRes() {
  const res = await request(app)
    .post(`${domain}/signup`)
    .send({
      email: emailUser,
      password: password,
      confirmPassword: confirmPassword,
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
  return res;
}

export async function categoryRes(adminToken) {
  const res = await request(app)
    .post(`${domain}/categories`)
    .send({
      category_name: faker.internet.domainWord(),
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .auth(adminToken, { type: 'bearer' });
  return res;
}

export async function productRes(adminToken, categoryId) {
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
    .attach('image_url', path.resolve(__dirname, '../product/product1.jpg'))
    .set('Content-Type', 'multipart/form-data')
    .auth(adminToken, { type: 'bearer' });
  return res;
}

export async function cartRes(userToken, productId) {
  const res = await request(app)
    .post(`${domain}/carts`)
    .send({
      product_id: productId,
      quantity: faker.number.int({ min: 1, max: 10 }),
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .auth(userToken, { type: 'bearer' });
  return res;
}
