import * as yup from "yup";
import { ValidationError as YupError } from "yup";

import { yupErrorToValidationError } from "~/core/types/converters.js";

import type { TambahKategoriDto } from "./TambahKategoriDto.js";

const schemaKategori = yup.object({
  nama: yup.string().required().min(1),
});

export function validasiDataKategori(body: unknown): TambahKategoriDto {
  try {
    schemaKategori.validateSync(body, { abortEarly: false });
  }
  catch (e) {
    if (e instanceof YupError)
      throw yupErrorToValidationError(e);
    throw e;
  }
  return { nama: (body as any).nama };
}
