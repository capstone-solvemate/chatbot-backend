import * as dotenv from "dotenv";

dotenv.config();

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: "mysql",
  port: process.env.DB_PORT,
  dialectOptions: {
    ssl: (!!process.env.DB_SECURE === true)
      ? {
          require: true,
          rejectUnauthorized: !!process.env.DB_IGNORE_SELF_SIGNED_CERT === false,
        }
      : undefined,
  },
};

export default {
  development: config,
  production: config,
};
