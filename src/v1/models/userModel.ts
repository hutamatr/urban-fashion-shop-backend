import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

export type UserCreationAttributes = Optional<
  IUser,
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'address'
  | 'phone_number'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
>;

/**
 * The code is defining a Sequelize model called "User" with the specified attributes and options. **/
const User: ModelDefined<IUser, UserCreationAttributes> = sequelize.define(
  'user',
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
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
  },
  {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    underscored: true,
    paranoid: true,
  }
);

export default User;
