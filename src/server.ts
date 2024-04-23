import app from './app';
import { sequelize } from './database/db';
import { host, port } from './utils/constants';
import Logger from './utils/logger';

sequelize
  .authenticate()
  .then(() => {
    Logger.debug('Connection has been established successfully.');
  })
  .catch((error) => {
    Logger.error('Unable to connect to the database:', error);
  });

sequelize
  // .sync({ force: true })
  .sync()
  .then((_result) => {
    app.listen(port, () => {
      Logger.debug(`Server running on ${host}:${port}`);
    });
  })
  .catch((error) => {
    Logger.error(error);
  });
