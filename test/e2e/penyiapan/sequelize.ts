import path from "node:path";
import { Sequelize } from "sequelize";
import { SequelizeStorage, Umzug } from "umzug";

import { DI } from "~/di/DI";

const sequelize = DI.provideSequelize();
const umzug = new Umzug({
  migrations: {
    glob: path.join(process.cwd(), "migrations/*.js"),
    resolve: ({ name, path: migrationPath, context }) => ({
      name,
      up: async () => {
        const migration = await import(migrationPath!);
        await migration.up(context, Sequelize);
      },
      down: async () => {
        const migration = await import(migrationPath!);
        await migration.down(context, Sequelize);
      },
    }),
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: undefined,
});

export async function migrateDatabase() {
  await umzug.up();
}

export async function resetDatabase() {
  await umzug.down({ to: 0 });
}
