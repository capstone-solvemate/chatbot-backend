import { DataTypes } from "sequelize";

import { DI } from "~/di/DI.js";
import { ModelPengguna } from "~/models/ModelPengguna.js";

export const ModelTiket = DI.provideSequelize().define("ModelTiket", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  judul: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  id_pembuat: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_chat: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  id_kategori: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  dibuat_pada: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  diperbarui_pada: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "tiket",
  timestamps: false,
});

ModelTiket.belongsTo(ModelPengguna, {
  foreignKey: "id_pembuat",
  as: "pembuat",
});
