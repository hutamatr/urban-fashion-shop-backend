import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

export interface IWishlist {
  id: number;
  product_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export type WishlistCreationAttributes = Optional<
  IWishlist,
  'id' | 'created_at' | 'updated_at'
>;

const Wishlist: ModelDefined<IWishlist, WishlistCreationAttributes> =
  sequelize.define(
    'wishlist',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
          model: 'products',
          key: 'id',
        },
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

export default Wishlist;
