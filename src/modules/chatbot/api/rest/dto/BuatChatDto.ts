import type { Request } from "express";

import * as yup from "yup";
import { ValidationError as YupError } from "yup";

import { HelperMulter } from "~/core/file/HelperMulter";
import { yupErrorToValidationError } from "~/core/types/converters";

const skemaValidasiBuatChat = yup.object({
  idKoneksiWs: yup.string().required(),
  pesan: yup.string().min(1, "Pesan tidak boleh kosong"),
});

export type BuatChatDto = {
  idKoneksiWs: string;
  pesan: string;
  lampiran: Express.Multer.File[];
};

export function validasiBuatChatDto(req: Request): BuatChatDto {
  const body = req.body;

  try {
    skemaValidasiBuatChat.validateSync(body, { abortEarly: false });
  }
  catch (e) {
    if (e instanceof YupError)
      throw yupErrorToValidationError(e);
    throw e;
  }

  return {
    idKoneksiWs: body.idKoneksiWs,
    pesan: body.pesan,
    lampiran: HelperMulter.ambilFileDariRequest(req),
  };
}
