import { DataTypes } from "sequelize";

import { DI } from "~/di/DI";

export const ModelFaq = DI.provideSequelize().define("ModelFaq", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_kategori: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: "faq",
  timestamps: false,
});
