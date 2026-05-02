import type { Request } from "express";

import * as yup from "yup";

import { yupErrorToValidationError } from "../../../core/types/converters.js";
import { MintaOtpDto, SimpanPasswordDto, VerifikasiOtpDto } from "./dto/ResetPasswordDto.js";
import { LoginDto } from "./LoginDto.js";

const loginDtoSchema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(8),
});

export function validasiLogin(request: Request): LoginDto {
  const body = request.body;

  try {
    loginDtoSchema.validateSync(body, {
      abortEarly: false,
    });
  }
  catch (e: any) {
    if (e instanceof yup.ValidationError) {
      throw yupErrorToValidationError(e);
    }
    else {
      throw e;
    }
  }

  return new LoginDto(body.email, body.password);
}

const mintaOtpSchema = yup.object({
  email: yup.string().required().email(),
});

const verifikasiOtpSchema = yup.object({
  email: yup.string().required().email(),
  otp: yup.string().required().min(6),
});

const simpanPasswordSchema = yup.object({
  reset_token: yup.string().required(),
  password_baru: yup.string().required().min(8),
  konfirmasi_password: yup.string().required().min(8),
});

export function validasiMintaOtp(request: Request): MintaOtpDto {
  const body = request.body;
  try {
    mintaOtpSchema.validateSync(body, { abortEarly: false });
  }
  catch (e: any) {
    if (e instanceof yup.ValidationError)
      throw yupErrorToValidationError(e);
    throw e;
  }
  return new MintaOtpDto(body.email);
}

export function validasiVerifikasiOtp(request: Request): VerifikasiOtpDto {
  const body = request.body;
  try {
    verifikasiOtpSchema.validateSync(body, { abortEarly: false });
  }
  catch (e: any) {
    if (e instanceof yup.ValidationError)
      throw yupErrorToValidationError(e);
    throw e;
  }
  return new VerifikasiOtpDto(body.email, body.otp);
}

export function validasiSimpanPassword(request: Request): SimpanPasswordDto {
  const body = request.body;
  try {
    simpanPasswordSchema.validateSync(body, { abortEarly: false });
  }
  catch (e: any) {
    if (e instanceof yup.ValidationError)
      throw yupErrorToValidationError(e);
    throw e;
  }
  return new SimpanPasswordDto(body.reset_token, body.password_baru, body.konfirmasi_password);
}
