import * as dotenv from "dotenv";

import { Config } from "../domain/Config.js";
import { DbConfig } from "../domain/DbConfig.js";
import { EmailConfig } from "../domain/EmailConfig.js";
import { RagConfig } from "../domain/RagConfig.js";

export class ConfigReader {
  constructor() {
    if (process.env.NODE_ENV === "test") {
      dotenv.config({ path: ".env.test" });
    }
    else {
      dotenv.config();
    }
  }

  read(): Config {
    return new Config(
      new DbConfig(
        process.env.DB_HOST || "localhost",
        Number.parseInt(process.env.DB_PORT || "3306"),
        process.env.DB_USER || "",
        process.env.DB_PASS || "",
        process.env.DB_NAME || "",
        !!process.env.DB_SECURE,
        !!process.env.DB_IGNORE_SELF_SIGNED_CERT,
      ),
      new EmailConfig(
        process.env.SMTP_HOST || "localhost",
        Number.parseInt(process.env.SMTP_PORT || "587"),
        process.env.SMTP_SECURE === "1",
        process.env.SMTP_USER || "",
        process.env.SMTP_PASSWORD || "",
        process.env.SMTP_FROM || "",
      ),
      new RagConfig(
        process.env.RAG_URL || "http://localhost:8000",
        Number.parseInt(process.env.RAG_K || "5"),
      ),
    );
  }
}
