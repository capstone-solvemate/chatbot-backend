import type { Model, ModelStatic, Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelFaqViewLog(
  sequelize: Sequelize,
  ModelFaq: ModelStatic<Model<any, any>>,
  ModelPengguna: ModelStatic<Model<any, any>>,
): ModelStatic<Model<any, any>> {
  const ModelFaqViewLog = sequelize.define(
    "ModelFaqViewLog",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_faq: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_pengguna: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dilihat_pada: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "faq_view_log",
      timestamps: false,
    },
  );

  ModelFaqViewLog.belongsTo(ModelFaq, { foreignKey: "id_faq" });
  ModelFaqViewLog.belongsTo(ModelPengguna, { foreignKey: "id_pengguna" });

  return ModelFaqViewLog;
}
