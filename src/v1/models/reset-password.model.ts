import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '../../database/db';

interface IResetPassword
  extends Model<
    InferAttributes<IResetPassword>,
    InferCreationAttributes<IResetPassword>
  > {
  id: CreationOptional<number>;
  user_id: number;
  token: string;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

const ResetPassword = sequelize.define<IResetPassword>(
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

export default ResetPassword;
