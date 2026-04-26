import type { Request } from "express";

import * as yup from "yup";

import { yupErrorToValidationError } from "~/core/types/converters";

import type { SubmitFaqDto } from "./dto/SubmitFaqDto.js";

const submitFaqSchema = yup.object({
  idKategori: yup.number().required().min(1),
  question: yup.string().required(),
  answer: yup.string().required(),
});

export function validasiSubmitFaq(req: Request): SubmitFaqDto {
  const body = req.body;

  try {
    submitFaqSchema.validateSync(body, {
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

  return {
    idKategori: body.idKategori,
    question: body.question,
    answer: body.answer,
  };
}
