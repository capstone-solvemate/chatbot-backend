import type { NextFunction, Request, Response } from "express";

import type { ValidationFieldError } from "./core/types/ValidationError.js";
import type ErrorResponse from "./interfaces/ErrorResponse.js";

import { UnauthenticatedError, UnauthenticatedReason } from "./core/types/UnauthenticatedError.js";
import { ValidationError } from "./core/types/ValidationError.js";
import { env } from "./env.js";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse | ValidationFieldError[]>, _next: NextFunction) {
  if (err instanceof ValidationError) {
    res.status(422);
    res.json(err.fields);
  }
  else if (err instanceof UnauthenticatedError) {
    res.status(401);
    res.json({
      error: "unauthenticated",
      message: "invalid credentials",
    });

    switch (err.reason) {
      case UnauthenticatedReason.UserNotFound:
        console.warn(new Date().toISOString(), `An unknown user attempted to log in.${err.email ? ` Email: ${err.email}` : ""}`);
        break;
      case UnauthenticatedReason.InvalidPassword:
        console.warn(new Date().toISOString(), `User with email "${err.email}" failed to log in due to an invalid password.`);
        break;
    }
  }
  else {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
      error: "unknown_error",
      message: err.message,
    });
    console.error(new Date().toISOString(), err.stack);
  }
}
