import sharp from "sharp";

import { ValidationError } from "~/core/types/ValidationError";

const dimensionLimit = 2048;

export async function validasiDimensiGambar(file: Express.Multer.File, index: number) {
  const metadata = await sharp(file.buffer).metadata();
  const { width = 0, height = 0 } = metadata;

  if (width > dimensionLimit || height > dimensionLimit) {
    throw new ValidationError([
      {
        field: `files[${index}]`,
        error: "dimension_too_large",
        message: `maximum image width and height are ${dimensionLimit}px`,
      },
    ]);
  }
}
