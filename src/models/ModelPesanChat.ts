import type { Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelPesanChat(sequelize: Sequelize) {
  return sequelize.define("ModelPesanChat", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_chat: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    pesan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tanggal_dibuat: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    chat_asisten: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    tableName: "pesan_chat",
    timestamps: false,
  });
}
