import type { Request } from "express";
import type { } from "multer";

export class HelperMulter {
  static ambilFileDariRequest(req: Request): Express.Multer.File[] {
    const files = req.files;

    if (Array.isArray(files)) {
      return files;
    }
    else if (files) {
      return Object.values(files).flat();
    }
    else {
      return [];
    }
  }
}
