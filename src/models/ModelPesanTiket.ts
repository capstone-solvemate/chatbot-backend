import { DataTypes } from "sequelize";

import { DI } from "~/di/DI.js";

export const ModelPesanTiket = DI.provideSequelize().define("ModelPesanTiket", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_tiket: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  id_pembuat: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pesan: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dibuat_pada: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "pesan_tiket",
  timestamps: false,
});
