import type { DbConfig } from "./DbConfig.js";
import type { EmailConfig } from "./EmailConfig.js";
import type { RagConfig } from "./RagConfig.js";

export class Config {
  constructor(
    public dbConfig: DbConfig,
    public emailConfig: EmailConfig,
    public ragConfig: RagConfig,
  ) {}
}
