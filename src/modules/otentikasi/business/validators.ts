import type { Request } from "express";

import * as yup from "yup";

import { yupErrorToValidationError } from "../../../core/types/converters.js";
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
