import * as yup from "yup";
import { ValidationError as YupError } from "yup";

import { yupErrorToValidationError } from "~/core/types/converters";

const skemaValidasiBuatChat = yup.object({
  pesan: yup.string().min(1, "Pesan tidak boleh kosong"),
});

export type BuatChatDto = {
  pesan: string;
  lampiran: Express.Multer.File[];
};

export function validasiBuatChatDto(payload: Record<string, any>): void {
  try {
    skemaValidasiBuatChat.validateSync(payload, { abortEarly: false });
  }
  catch (e) {
    if (e instanceof YupError)
      throw yupErrorToValidationError(e);
    throw e;
  }
}
