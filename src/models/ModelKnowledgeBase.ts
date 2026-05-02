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
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('BelumDiproses', 'SedangDiproses', 'SelesaiDiproses'),
    allowNull: false,
    defaultValue: 'BelumDiproses'
  },
}, {
  tableName: "knowledge_base",
  timestamps: true, // Asumsi migration menambahkan createdAt dan updatedAt
});
