import * as yup from "yup";

import { yupErrorToValidationError } from "~/core/types/converters.js";

import type { DtoKirimReport } from "./DtoKirimReport.js";

const skemaKirimReport = yup.object({
  emailTujuan: yup.string().required().email(),
  zonaWaktu: yup.number().required(),
  tahun: yup.number().required(),
  bulan: yup.number().optional().min(1).max(12),
});

export function validasiKirimReport(body: any): DtoKirimReport {
  try {
    skemaKirimReport.validateSync(body, {
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
    emailTujuan: body.emailTujuan,
    zonaWaktu: body.zonaWaktu,
    tahun: body.tahun,
    bulan: body.bulan ?? undefined,
  };
}
