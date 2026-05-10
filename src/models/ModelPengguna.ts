import type { Model, ModelStatic, Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelPengguna(sequelize: Sequelize): ModelStatic<Model<any, any>> {
  return sequelize.define("ModelPengguna", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nama: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    isActive: {
      field: "is_active",
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: "pengguna",
    timestamps: false,
  });
}
