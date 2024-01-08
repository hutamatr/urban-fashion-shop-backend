import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';

import { sequelize } from '../../database/db';

interface ICart
  extends Model<InferAttributes<ICart>, InferCreationAttributes<ICart>> {
  id: CreationOptional<number>;
  total_price: number;
  user_id: number;
  products?: NonAttribute<IProduct[]>;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

const Cart = sequelize.define<ICart>(
  'cart',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'users',
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
  },
  {
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Cart;
