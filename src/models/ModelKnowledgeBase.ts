import type { CreationOptional, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";

import { DataTypes, Model } from "sequelize";

export class ModelKnowledgeBase extends Model<
  InferAttributes<ModelKnowledgeBase, { omit: "created_at" | "updated_at" }>,
  InferCreationAttributes<ModelKnowledgeBase, { omit: "created_at" | "updated_at" }>
> {
  declare id: CreationOptional<bigint>;
  declare doc_id: string;
  declare judul: string;
  declare id_kategori: number;
  declare nama_berkas: string;
  declare path: string;
  declare status: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

export function initModelKnowledgeBase(sequelize: Sequelize): void {
  ModelKnowledgeBase.init({
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
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: "knowledge_base",
    timestamps: true,
    underscored: true,
  });
}
