import { Sequelize } from "sequelize";

import type { Config } from "~/core/config/domain/Config";

export function createSequelize(config: Config): Sequelize {
  const dbConfig = config.dbConfig;

  return new Sequelize(
    dbConfig.dbName,
    dbConfig.user,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: "mysql",
      port: dbConfig.port,
      dialectOptions: {
        ssl: (dbConfig.secureConn)
          ? {
              require: true,
              rejectUnauthorized: !dbConfig.ignoreSelfSignedCert,
            }
          : undefined,
      },
      logging: false,
    },
  );
}
