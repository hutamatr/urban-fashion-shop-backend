import { DataTypes, ModelDefined, Optional } from 'sequelize';

import { sequelize } from '../../database/db';

interface IRole {
  id: number;
  role_name: string;
  created_at: string;
  updated_at: string;
}

type RoleCreationAttributes = Optional<
  IRole,
  'id' | 'created_at' | 'updated_at'
>;

/* The code is defining a Sequelize model for a category entity. */
const Role: ModelDefined<IRole, RoleCreationAttributes> = sequelize.define(
  'role',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
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

export default Role;
