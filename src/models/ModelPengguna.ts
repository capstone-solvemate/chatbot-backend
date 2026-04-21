import { DataTypes } from "sequelize";

import { DI } from "~/di/DI";

export const ModelPengguna = DI.provideSequelize().define("ModelPengguna", {
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
}, {
  tableName: "pengguna",
  timestamps: false,
});
