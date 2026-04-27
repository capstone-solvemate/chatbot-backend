import type { Request } from "express";

import * as yup from "yup";

import { yupErrorToValidationError } from "~/core/types/converters";

import type { GetFaqsRequestDto } from "./dto/GetFaqsRequestDto.js";
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

const getFaqsRequestSchema = yup.object({
  idkategori: yup.number().optional().positive(),
  query: yup.string().optional(),
});

export function validasiGetFaqsRequest(req: Request): GetFaqsRequestDto {
  const data = req.query;

  try {
    getFaqsRequestSchema.validateSync(data, {
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
    idkategori: data.idkategori ? Number.parseInt(data.idkategori as string) : null,
    query: data.query ? (data.query as string) : null,
  };
}
