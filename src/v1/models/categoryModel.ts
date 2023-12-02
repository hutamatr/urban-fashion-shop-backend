import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

interface ICategory {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

type CategoryCreationAttributes = Optional<
  ICategory,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

/* The code is defining a Sequelize model for a category entity. */
const Category: ModelDefined<ICategory, CategoryCreationAttributes> =
  sequelize.define(
    'Category',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

export default Category;
