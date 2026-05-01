import { DataTypes } from "sequelize";

import { DI } from "~/di/DI";

export const ModelNotifikasi = DI.provideSequelize().define("ModelNotifikasi", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },

  id_pengguna: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  type: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  judul: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },

  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  extra_data: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  dibuat_pada: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  dibaca_pada: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "notifikasi",
  timestamps: false,
});
