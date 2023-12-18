import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

interface IProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  discount_percentage: number;
  discounted_price: number;
  stock_quantity: number;
  category_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

type ProductCreationAttributes = Optional<
  IProduct,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

/** The code `const Product = sequelize.define(...)` is defining a Sequelize model for a
 * "product" table in a database.
 **/
const Product: ModelDefined<IProduct, ProductCreationAttributes> =
  sequelize.define(
    'product',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      discount_percentage: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      discounted_price: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      stock_quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
          model: 'categories',
          key: 'id',
        },
      },
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      underscored: true,
      paranoid: true,
    }
  );

export default Product;
