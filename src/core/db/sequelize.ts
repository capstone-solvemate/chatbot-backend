import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env!.DB_NAME!,
  process.env!.DB_USER!,
  process.env!.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: Number.parseInt(process.env.DB_PORT || "3306"),
    dialectOptions: {
      ssl: {
        require: (!!process.env!.DB_SECURE) === true,
        rejectUnauthorized: (!!process.env!.DB_IGNORE_SELF_SIGNED_CERT) !== true,
      },
    },
    logging: false,
  },
);
