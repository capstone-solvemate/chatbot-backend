import * as yup from "yup";

import { yupErrorToValidationError } from "~/core/types/converters";

import type { GetPenggunaDto } from "./GetPenggunaDto.js";
import type { TambahPenggunaDto } from "./TambahPenggunaDto.js";

const tambahPenggunaSchema = yup.object({
  nama: yup.string().required(),
  email: yup.string().required().email(),
  password: yup.string().required().min(8),
  peran: yup.array(yup.number().defined()).required().min(1),
});

export function validasiDataTambahPengguna(data: Record<string, any>): TambahPenggunaDto {
  try {
    const output = tambahPenggunaSchema.validateSync(data, { abortEarly: false });
    return output;
  }
  catch (e: any) {
    if (e instanceof yup.ValidationError)
      throw yupErrorToValidationError(e);
    throw e;
  }
}

const getPenggunaSchema = yup.object({
  cari: yup.string().optional(),
});

export function validasiDataGetPengguna(data: Record<string, any>): GetPenggunaDto {
  try {
    const output = getPenggunaSchema.validateSync(data, { abortEarly: false });
    return output;
  }
  catch (e: any) {
    if (e instanceof yup.ValidationError)
      throw yupErrorToValidationError(e);
    throw e;
  }
}
