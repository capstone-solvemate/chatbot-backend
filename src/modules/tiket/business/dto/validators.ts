import type { Request } from "express";

import * as yup from "yup";

import { yupErrorToValidationError } from "~/core/types/converters.js";

import { intToStatusTiket } from "../../domain/StatusTiket.js";
import { BuatPesanTiketDto } from "./BuatPesanTiketDto.js";
import { BuatTiketDto } from "./BuatTiketDto.js";
import { UpdateStatusTiketDto } from "./UpdateStatusTiketDto.js";

const buatTiketSchema = yup.object({
  judul: yup.string().required().min(3),
  deskripsi: yup.string().required().min(1),
  idChat: yup.string().required(),
  idKategori: yup.number().required().integer().positive(),
});

const buatPesanTiketSchema = yup.object({
  pesan: yup.string().required().min(1),
  lampiranIds: yup.array().of(yup.string().required()).optional().default([]),
});

const updateStatusTiketSchema = yup.object({
  status: yup.number().required().integer().min(1).max(3),
});

export function validasiBuatTiket(req: Request): BuatTiketDto {
  const body = req.body;
  try {
    buatTiketSchema.validateSync(body, { abortEarly: false });
  }
  catch (e: any) {
    if (e instanceof yup.ValidationError) {
      throw yupErrorToValidationError(e);
    }
    throw e;
  }
  return new BuatTiketDto(body.judul, body.deskripsi, BigInt(body.idChat), Number(body.idKategori));
}

export function validasiBuatPesanTiket(req: Request): BuatPesanTiketDto {
  const body = req.body;
  try {
    buatPesanTiketSchema.validateSync(body, { abortEarly: false });
  }
  catch (e: any) {
    if (e instanceof yup.ValidationError) {
      throw yupErrorToValidationError(e);
    }
    throw e;
  }
  return new BuatPesanTiketDto(body.pesan, body.lampiranIds ?? []);
}

export function validasiUpdateStatusTiket(req: Request): UpdateStatusTiketDto {
  const body = req.body;
  try {
    updateStatusTiketSchema.validateSync(body, { abortEarly: false });
  }
  catch (e: any) {
    if (e instanceof yup.ValidationError) {
      throw yupErrorToValidationError(e);
    }
    throw e;
  }
  const status = intToStatusTiket(Number(body.status));
  if (status === null) {
    throw new yup.ValidationError("status is a required field", body.status, "status");
  }
  return new UpdateStatusTiketDto(status);
}
