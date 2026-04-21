import { DataTypes } from "sequelize";

import { DI } from "~/di/DI.js";

import { ModelPengguna } from "./ModelPengguna.js";

export const ModelRefreshToken = DI.provideSequelize().define(
  "ModelRefreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idPengguna: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_pengguna",
    },
    peran: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    terakhirDipakai: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "terakhir_dipakai",
    },
    kadaluarsaPada: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "kadaluarsa_pada",
    },
    dibuatPada: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "dibuat_pada",
    },
  },
  {
    tableName: "refresh_token",
    timestamps: false,
  },
);

ModelRefreshToken.belongsTo(ModelPengguna, {
  foreignKey: "id_pengguna",
  as: "ModelPengguna",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});
