import type { WsErrorResponse } from "~/core/api/ws/dto/WsErrorResponse";

import { DataNotFoundError } from "~/core/types/DataNotFoundError.js";
import { ForbiddenError } from "~/core/types/ForbiddenError.js";
import { UnauthenticatedError, UnauthenticatedReason } from "~/core/types/UnauthenticatedError";

import { ApiErrorCodes } from "../ApiErrorCodes.js";
import { WsErrorStatus } from "./types/WsErrorStatus.js";

export function errorToWsError(err: any): { status: number; error: WsErrorResponse } {
  if (err instanceof UnauthenticatedError) {
    return {
      status: WsErrorStatus.Unauthenticated,
      error: {
        error: ApiErrorCodes.Unauthenticated,
        message: err.reason === UnauthenticatedReason.InvalidToken ? "invalid token" : "unauthenticated",
      },
    };
  }
  else if (err instanceof ForbiddenError) {
    return {
      status: WsErrorStatus.Forbidden,
      error: {
        error: ApiErrorCodes.Forbidden,
        message: "you don't have permission to access this resource.",
      },
    };
  }
  else if (err instanceof DataNotFoundError) {
    return {
      status: WsErrorStatus.NotFound,
      error: {
        error: ApiErrorCodes.DataNotFound,
        message: err.message,
      },
    };
  }
  else {
    console.error(err);
    return {
      status: WsErrorStatus.ServerError,
      error: {
        error: ApiErrorCodes.ServerError,
        message: "internal server error",
      },
    };
  }
}
