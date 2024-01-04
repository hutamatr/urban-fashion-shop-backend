import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

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
