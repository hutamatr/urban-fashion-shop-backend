import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '../../database/db';

interface IWishlist
  extends Model<
    InferAttributes<IWishlist>,
    InferCreationAttributes<IWishlist>
  > {
  id: CreationOptional<number>;
  product_id: number;
  user_id: number;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

const Wishlist = sequelize.define<IWishlist>(
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

export default Wishlist;
