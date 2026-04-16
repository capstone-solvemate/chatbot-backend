import type * as yup from "yup";

import type { ValidationFieldError } from "./ValidationError.js";

import { createEmailFieldError, createEmptyFieldError, createMinLengthFieldError, ValidationError } from "./ValidationError.js";

const requiredPttn = " is a required field";
const emailPttn = " must be a valid email";
const minLengthPttn = / must be at least \d+ characters$/;
const minLengthCatcher = / must be at least (\d+) characters$/;

export function yupErrorToValidationError(yupErr: yup.ValidationError): ValidationError {
  const errFields: Map<string, ValidationFieldError> = new Map();
  yupErr.errors.forEach((err: string) => {
    if (err.endsWith(requiredPttn)) {
      const fieldName = err.slice(0, err.indexOf(requiredPttn));
      if (!errFields.has(fieldName)) {
        errFields.set(fieldName, createEmptyFieldError(
          fieldName,
        ));
      }
    }
    else if (err.endsWith(emailPttn)) {
      const fieldName = err.slice(0, err.indexOf(emailPttn));

      if (!errFields.has(fieldName)) {
        errFields.set(fieldName, createEmailFieldError(
          fieldName,
        ));
      }
    }
    else if (minLengthPttn.test(err)) {
      const fieldName = err.replace(minLengthPttn, "");

      if (!errFields.has(fieldName)) {
        let length = 0;
        const match = err.match(minLengthCatcher);
        if ((match?.length ?? 0) >= 2) {
          length = Number.parseInt(match![1]);
        }
        errFields.set(fieldName, createMinLengthFieldError(
          fieldName,
          length,
        ));
      }
    }
    else {
      errFields.set("unknown", {
        field: "unknown",
        error: "unknown",
        message: "unknown",
      });
    }
  });

  throw new ValidationError(Array.from(errFields.values()));
}
