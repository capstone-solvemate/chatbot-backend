import type { Model, ModelStatic, Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelTiket(sequelize: Sequelize, modelPengguna: ModelStatic<Model<any, any>>): ModelStatic<Model<any, any>> {
  const modelTiket = sequelize.define("ModelTiket", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    judul: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    id_pembuat: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_chat: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    id_kategori: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    dibuat_pada: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    diperbarui_pada: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "tiket",
    timestamps: false,
  });

  modelTiket.belongsTo(modelPengguna, {
    foreignKey: "id_pembuat",
    as: "pembuat",
  });

  return modelTiket;
}
