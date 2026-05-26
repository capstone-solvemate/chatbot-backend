import type { Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelLampiranPesanChat(sequelize: Sequelize) {
  return sequelize.define("ModelLampiranPesanChat", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_pesan_chat: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    nama_berkas: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    ukuran: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  }, {
    tableName: "lampiran_pesan_chat",
    timestamps: false,
  });
}
