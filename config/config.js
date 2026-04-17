import "dotenv/config";

export default {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    dialectOptions: {
      ssl: {
        require: process.env.DB_SECURE === true,
        rejectUnauthorized: !!process.env.DB_IGNORE_SELF_SIGNED_CERT === false,
      },
    },
  },
};
