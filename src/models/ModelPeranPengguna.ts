import { DataTypes } from "sequelize";

import { DI } from "~/di/DI";

import { ModelPengguna } from "./ModelPengguna.js";

export const ModelPeranPengguna = DI.provideSequelize().define("ModelPeranPengguna", {
  id_pengguna: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "pengguna",
      key: "id",
    },
  },

  peran: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
}, {
  tableName: "peran_pengguna",
  timestamps: false,
});

ModelPeranPengguna.belongsTo(ModelPengguna, {
  foreignKey: "id_pengguna",
  targetKey: "id",
  as: "ModelPengguna",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});
