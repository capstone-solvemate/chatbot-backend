import type { Request } from "express";

import * as yup from "yup";

import { yupErrorToValidationError } from "~/core/types/converters.js";
import { createEmptyFieldError, ValidationError } from "~/core/types/ValidationError.js";

import { UploadDokumenDto } from "./UploadDokumenDto.js";

const uploadDokumenSchema = yup.object({
  judul: yup.string().required().min(1),
  idKategori: yup.number().required().integer().positive(),
});

export function validasiUploadDokumen(req: Request): UploadDokumenDto {
  if (!req.file) {
    throw new ValidationError([createEmptyFieldError("file")]);
  }

  const body = {
    ...req.body,
    idKategori: req.body.idKategori !== undefined ? Number(req.body.idKategori) : undefined,
  };

  try {
    uploadDokumenSchema.validateSync(body, { abortEarly: false });
  }
  catch (e: any) {
    if (e instanceof yup.ValidationError) {
      throw yupErrorToValidationError(e);
    }
    throw e;
  }

  return new UploadDokumenDto(
    body.judul.trim(),
    Number.parseInt(body.idKategori),
    req.file,
  );
}
