import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

type CartItemCreationAttributes = Optional<
  ICartItem,
  'id' | 'created_at' | 'updated_at'
>;

const CartItem: ModelDefined<ICartItem, CartItemCreationAttributes> =
  sequelize.define(
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
    },
    {
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

export default CartItem;
