import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '../../database/db';

interface ICategory
  extends Model<
    InferAttributes<ICategory>,
    InferCreationAttributes<ICategory>
  > {
  id: CreationOptional<number>;
  category_name: string;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

/* The code is defining a Sequelize model for a category entity. */
const Category = sequelize.define<ICategory>(
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

export default Category;
