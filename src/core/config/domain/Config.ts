import type { DbConfig } from "./DbConfig.js";
import type { EmailConfig } from "./EmailConfig.js";

export class Config {
  constructor(
    public dbConfig: DbConfig,
    public emailConfig: EmailConfig,
  ) {}
}
