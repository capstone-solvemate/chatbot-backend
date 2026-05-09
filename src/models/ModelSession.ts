import type { Model, ModelStatic, Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelSession(sequelize: Sequelize, modelPengguna: ModelStatic<Model<any, any>>): ModelStatic<Model<any, any>> {
  const modelSession = sequelize.define(
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

  modelSession.belongsTo(modelPengguna, {
    foreignKey: "id_pengguna",
    as: "ModelPengguna",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  return modelSession;
}
