import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';

import { sequelize } from '../../database/db';

export interface ITransaction
  extends Model<
    InferAttributes<ITransaction>,
    InferCreationAttributes<ITransaction>
  > {
  id: CreationOptional<string>;
  user_id: number;
  total_price: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELED';
  shipping_status: 'PROCESSING' | 'SHIPPING' | 'SHIPPED';
  snap_token: string;
  snap_redirect_url: string;
  payment_method: CreationOptional<string>;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
  user?: NonAttribute<IUser>;
  products?: NonAttribute<IProduct[]>;
}

const Transaction = sequelize.define<ITransaction>(
  'transaction',
  {
    id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING_PAYMENT', 'PAID', 'CANCELED'),
      allowNull: false,
    },
    shipping_status: {
      type: DataTypes.ENUM('PROCESSING', 'SHIPPING', 'SHIPPED'),
      allowNull: false,
    },
    snap_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    snap_redirect_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Transaction;
