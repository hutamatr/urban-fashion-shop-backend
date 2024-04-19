import app from './app';
import { sequelize } from './database/db';
import { host, port } from './utils/constants';

sequelize
  .authenticate()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Unable to connect to the database:', error);
  });

sequelize
  // .sync({ force: true })
  .sync()
  .then((_result) => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on ${host}:${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
