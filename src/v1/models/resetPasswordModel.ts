import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

export type ResetPasswordCreationAttributes = Optional<
  IResetPassword,
  'id' | 'created_at' | 'updated_at'
>;

const ResetPassword: ModelDefined<
  IResetPassword,
  ResetPasswordCreationAttributes
> = sequelize.define(
  'reset_password',
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
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export default ResetPassword;
