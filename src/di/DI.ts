import type { Sequelize } from "sequelize";

import type { Config } from "~/core/config/domain/Config";

import { ConfigReader } from "~/core/config/business/ConfigReader";
import { createSequelize } from "~/core/db/sequelize";

export class DI {
  private static config: Config | null = null;
  static provideConfig(): Config {
    if (!this.config) {
      this.config = new ConfigReader().read();
    }
    return this.config;
  }

  private static sequelize: Sequelize | null = null;
  static provideSequelize(): Sequelize {
    if (!this.sequelize) {
      this.sequelize = createSequelize(this.provideConfig());
    }
    return this.sequelize;
  }
}
