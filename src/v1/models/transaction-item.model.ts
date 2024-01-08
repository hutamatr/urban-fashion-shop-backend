import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '../../database/db';

interface ITransactionItem
  extends Model<
    InferAttributes<ITransactionItem>,
    InferCreationAttributes<ITransactionItem>
  > {
  id: CreationOptional<number>;
  transaction_id: string;
  product_id: number;
  quantity: number;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

const TransactionItem = sequelize.define<ITransactionItem>(
  'transaction_item',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    transaction_id: {
      type: DataTypes.STRING(255),
      references: {
        model: 'transactions',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
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
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default TransactionItem;
