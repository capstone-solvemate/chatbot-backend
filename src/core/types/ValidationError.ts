export class ValidationError extends Error {
  constructor(public fields: ValidationFieldError[]) {
    super("ValidationError");
  }
}

export type ValidationFieldError = {
  field: string;
  error: string;
  message: string;
};

export function createEmptyFieldError(fieldName: string): ValidationFieldError {
  return {
    field: fieldName,
    error: "required",
    message: "this field is required.",
  };
}

export function createEmailFieldError(fieldName: string): ValidationFieldError {
  return {
    field: fieldName,
    error: "invalid_email",
    message: "this field must contain a valid email address.",
  };
}

export function createMinLengthFieldError(fieldName: string, minLength: number): ValidationFieldError {
  return {
    field: fieldName,
    error: `min_length_${minLength}`,
    message: `this field must be at least ${minLength} characters long`,
  };
}
