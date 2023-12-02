import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

interface IUser {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

type UserCreationAttributes = Optional<
  IUser,
  'id' | 'first_name' | 'last_name' | 'created_at' | 'updated_at'
>;

/**
 * The code is defining a Sequelize model called "User" with the specified attributes and options. **/
const User: ModelDefined<IUser, UserCreationAttributes> = sequelize.define(
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
