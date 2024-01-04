import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

type CategoryCreationAttributes = Optional<
  ICategory,
  'id' | 'created_at' | 'updated_at'
>;

/* The code is defining a Sequelize model for a category entity. */
const Category: ModelDefined<ICategory, CategoryCreationAttributes> =
  sequelize.define(
    'category',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      category_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
    },
    {
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

export default Category;
