import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

interface IProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  quantity: number;
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
    'Product',
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
      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
          model: 'Categories',
          key: 'id',
        },
      },
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true,
    }
  );

export default Product;
