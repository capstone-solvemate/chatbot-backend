import type { Model, ModelStatic, Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelResetPassword(sequelize: Sequelize): ModelStatic<Model<any, any>> {
  return sequelize.define("ModelResetPassword", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    reset_token: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true,
    },
    otp_expired_pada: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_token_expired_pada: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    percobaan_salah: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    jumlah_permintaan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    permintaan_pertama_pada: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dibuat_pada: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "reset_password",
    timestamps: false,
  });
}
