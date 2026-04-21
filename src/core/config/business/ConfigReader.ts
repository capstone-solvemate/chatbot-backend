import * as dotenv from "dotenv";

import { Config } from "../domain/Config.js";
import { DbConfig } from "../domain/DbConfig.js";

export class ConfigReader {
  constructor() {
    dotenv.config();
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
    );
  }
}
