import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '../../database/db';

interface IRefreshToken
  extends Model<
    InferAttributes<IRefreshToken>,
    InferCreationAttributes<IRefreshToken>
  > {
  id: CreationOptional<number>;
  user_id: number;
  refresh_token: string;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

/**
 * The code is defining a Sequelize model called "RefreshToken" with the specified attributes and options. **/
const RefreshToken = sequelize.define<IRefreshToken>(
  'refresh_token',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    refresh_token: {
      type: DataTypes.STRING(500),
      unique: true,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export default RefreshToken;
