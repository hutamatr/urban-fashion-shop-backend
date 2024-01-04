import { Sequelize } from 'sequelize';

import { dbName, dbPassword, dbUser } from '../utils/constants';

/** The code is creating a new instance of the Sequelize class and assigning it to the constant
 * `sequelize`. The Sequelize class is a constructor function provided by the Sequelize
 * library, which is an Object-Relational Mapping (ORM) tool for Node.js.
 **/
export const sequelize = new Sequelize({
  database: dbName,
  username: dbUser,
  password: dbPassword,
  host: 'localhost',
  dialect: 'mysql',
  timezone: '+07:00',
  // eslint-disable-next-line no-console
  logging: console.log,
});
