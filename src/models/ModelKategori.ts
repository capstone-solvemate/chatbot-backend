import type { Model, ModelStatic, Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelKategori(sequelize: Sequelize): ModelStatic<Model<any, any>> {
  return sequelize.define("ModelKategori", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: "kategori",
    timestamps: false,
  });
}
