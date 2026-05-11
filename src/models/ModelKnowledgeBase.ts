import type { Model, ModelStatic, Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelKnowledgeBase(sequelize: Sequelize): ModelStatic<Model<any, any>> {
  return sequelize.define("ModelKnowledgeBase", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    doc_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true,
    },
    judul: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_kategori: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_berkas: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ukuran_berkas: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: "knowledge_base",
    timestamps: true,
    underscored: true,
  });
}
