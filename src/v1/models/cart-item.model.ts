import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from 'sequelize';

import { sequelize } from '../../database/db';

interface ICartItem
  extends Model<
    InferAttributes<ICartItem>,
    InferCreationAttributes<ICartItem>
  > {
  id: CreationOptional<number>;
  quantity: number;
  cart_id: number;
  product_id: number;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
  products?: NonAttribute<IProduct[]>;
}

const CartItem = sequelize.define<ICartItem>(
  'cart_item',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cart_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'carts',
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

export default CartItem;
