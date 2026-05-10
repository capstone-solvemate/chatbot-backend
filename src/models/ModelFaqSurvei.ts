import type { Model, ModelStatic, Sequelize } from "sequelize";

import { DataTypes } from "sequelize";

export function createModelFaqSurvei(
  sequelize: Sequelize,
  ModelFaq: ModelStatic<Model<any, any>>,
  ModelPengguna: ModelStatic<Model<any, any>>,
): ModelStatic<Model<any, any>> {
  const ModelFaqSurvei = sequelize.define(
    "ModelFaqSurvei",
    {
      id_faq: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_pengguna: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jawaban: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      dijawab_pada: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "faq_survei",
      timestamps: false,
    },
  );

  ModelFaqSurvei.belongsTo(ModelFaq, { foreignKey: "id_faq" });
  ModelFaqSurvei.belongsTo(ModelPengguna, { foreignKey: "id_pengguna" });

  return ModelFaqSurvei;
}
