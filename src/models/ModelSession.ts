import { DataTypes } from "sequelize";

import { DI } from "~/di/DI";

import { ModelPengguna } from "./ModelPengguna.js";

export const ModelSession = DI.provideSequelize().define(
  "ModelSession",
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
    },

    id_pengguna: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    peran_pengguna: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    csrf_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    aktivitas_terakhir_pada: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "session",
    timestamps: false,
  },
);

ModelSession.belongsTo(ModelPengguna, {
  foreignKey: "id_pengguna",
  as: "ModelPengguna",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});
