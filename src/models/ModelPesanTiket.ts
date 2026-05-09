import type { Model, ModelStatic, Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelPesanTiket(sequelize: Sequelize): ModelStatic<Model<any, any>> {
  return sequelize.define("ModelPesanTiket", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_tiket: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    id_pembuat: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pesan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dibuat_pada: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "pesan_tiket",
    timestamps: false,
  });
}
