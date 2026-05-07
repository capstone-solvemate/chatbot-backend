import { DataTypes } from "sequelize";

import { DI } from "~/di/DI.js";

export const ModelKnowledgeBase = DI.provideSequelize().define("ModelKnowledgeBase", {
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
  nama_berkas: {
    type: DataTypes.TEXT,
    allowNull: false,
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
