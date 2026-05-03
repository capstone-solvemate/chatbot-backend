import type { Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelChat(sequelize: Sequelize) {
  return sequelize.define("ModelChat", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_pembuat: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tanggal_dibuat: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    subjek: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: "chat",
    timestamps: false,
  });
}
