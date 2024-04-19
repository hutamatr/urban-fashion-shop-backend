import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '../../database/db';

interface IUser
  extends Model<InferAttributes<IUser>, InferCreationAttributes<IUser>> {
  id: CreationOptional<number>;
  email: string;
  password: string;
  first_name: CreationOptional<string>;
  last_name: CreationOptional<string>;
  city: CreationOptional<string>;
  postal_code: CreationOptional<string>;
  address: CreationOptional<string>;
  phone_number: CreationOptional<string>;
  role_id: number;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
  deleted_at: CreationOptional<Date>;
}

/**
 * The code is defining a Sequelize model called "User" with the specified attributes and options. **/
const User = sequelize.define<IUser>(
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
    city: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    postal_code: {
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
