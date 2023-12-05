import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

interface ICart {
  id: number;
  total_price: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

type CartCreationAttributes = Optional<
  ICart,
  'id' | 'created_at' | 'updated_at'
>;

const Cart: ModelDefined<ICart, CartCreationAttributes> = sequelize.define(
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
  },
  {
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Cart;
