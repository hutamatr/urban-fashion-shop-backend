import { DataTypes } from 'sequelize';

import { sequelize } from '../../database/db';

/**
 * The code is defining a Sequelize model called "User" with the specified attributes and options. **/
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default User;
