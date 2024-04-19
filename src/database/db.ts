import { Dialect, Sequelize } from 'sequelize';

import {
  dbHostDevelopment,
  dbHostProduction,
  dbHostTest,
  dbNameDevelopment,
  dbNameProduction,
  dbNameTest,
  dbPassword,
  dbUser,
  env,
} from '../utils/constants';

const dbConfig: {
  [key: string]: {
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    host: string | undefined;
    dialect: Dialect | undefined;
    timezone: string | undefined;
    logging?: boolean;
  };
} = {
  development: {
    username: dbUser,
    password: dbPassword,
    database: dbNameDevelopment,
    host: dbHostDevelopment,
    dialect: 'mysql',
    timezone: '+07:00',
    logging: true,
  },
  test: {
    username: dbUser,
    password: dbPassword,
    database: dbNameTest,
    host: dbHostTest,
    dialect: 'mysql',
    timezone: '+07:00',
    logging: false,
  },
  production: {
    username: dbUser,
    password: dbPassword,
    database: dbNameProduction,
    host: dbHostProduction,
    dialect: 'mysql',
    timezone: '+07:00',
    logging: false,
  },
};

const databaseConfig = dbConfig[env || 'development'];
export const sequelize = new Sequelize(databaseConfig);
