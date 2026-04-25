import { DataTypes } from "sequelize";

import { DI } from "~/di/DI";

export const ModelKategori = DI.provideSequelize().define("ModelKategori", {
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
