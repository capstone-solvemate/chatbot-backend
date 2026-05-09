import type { Model, ModelStatic, Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelPeranPengguna(sequelize: Sequelize, modelPengguna: ModelStatic<Model<any, any>>): ModelStatic<Model<any, any>> {
  const modelPeranPengguna = sequelize.define("ModelPeranPengguna", {
    id_pengguna: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "pengguna",
        key: "id",
      },
    },

    peran: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  }, {
    tableName: "peran_pengguna",
    timestamps: false,
  });

  modelPeranPengguna.belongsTo(modelPengguna, {
    foreignKey: "id_pengguna",
    targetKey: "id",
    as: "ModelPengguna",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  });

  modelPengguna.hasMany(modelPeranPengguna, {
    foreignKey: "id_pengguna",
    sourceKey: "id",
    as: "ModelPeranPengguna",
  });

  return modelPeranPengguna;
}
