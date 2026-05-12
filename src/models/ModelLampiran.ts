import type { Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelLampiran(sequelize: Sequelize) {
  return sequelize.define("ModelLampiran", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    jenis_pesan: {
      type: DataTypes.ENUM("chat", "tiket"),
      allowNull: false,
    },
    id_pesan: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    id_pengunggah: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_asli: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dibuat_pada: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "lampiran",
    timestamps: false,
  });
}
