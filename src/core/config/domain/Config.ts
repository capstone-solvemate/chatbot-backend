import type { DbConfig } from "./DbConfig.js";

export class Config {
  constructor(
    public dbConfig: DbConfig,
  ) {}
}
