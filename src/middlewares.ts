import type { NextFunction, Request, Response } from "express";

import type { ValidationFieldError } from "./core/types/ValidationError.js";
import type ErrorResponse from "./interfaces/ErrorResponse.js";
import type { PeranPengguna } from "./modules/pengguna/domain/PeranPengguna.js";

import { ConflictError } from "./core/types/ConflictError.js";
import { ForbiddenError } from "./core/types/ForbiddenError.js";
import { InvalidCsrfToken } from "./core/types/InvalidCsrfTokenError.js";
import { TooManyRequestsError } from "./core/types/TooManyRequestsError.js";
import { UnauthenticatedError, UnauthenticatedReason } from "./core/types/UnauthenticatedError.js";
import { ValidationError } from "./core/types/ValidationError.js";
import { DI } from "./di/DI.js";

const kontrolOtentikasi = DI.provideKontrolOtentikasi();
const repositoriSesison = DI.provideRepositoriSession();

export function session(req: Request, res: Response, next: NextFunction) {
  const fn = async () => {
    try {
      const cookies = req.cookies;
      if (!cookies.session) {
        await kontrolOtentikasi.tanganiSessionTidakValid(req, res);
        return;
      }
      const session = await repositoriSesison.getById(cookies.session);
      if (!session) {
        await kontrolOtentikasi.tanganiSessionTidakValid(req, res);
        return;
      }
      req.sesiPengguna = {
        sessionId: session!.id,
        csrfToken: session!.csrfToken,
        idPengguna: session!.idPengguna,
        peranPengguna: session!.peranPengguna,
      };
      await repositoriSesison.updateAktivitas(session!.id);
      next();
    }
    catch (e: any) {
      next(e);
    }
  };
  fn();
}

export function csrfGuard(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.method === "GET") {
      next();
      return;
    }

    const csrfToken = req.headers["x-csrf-token"];
    if (!csrfToken) {
      kontrolOtentikasi.tanganiCsrfTidakValid(req, res);
      return;
    }

    if (csrfToken !== req.sesiPengguna!.csrfToken) {
      kontrolOtentikasi.tanganiCsrfTidakValid(req, res);
      return;
    }

    next();
  }
  catch (e: any) {
    next(e);
  }
}

export function auth(peranDiizinkan: PeranPengguna[]): (req: Request, res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    if (!req.sesiPengguna?.idPengguna) {
      next(new UnauthenticatedError(UnauthenticatedReason.NoToken));
      return;
    }

    const peran = req.sesiPengguna.peranPengguna;
    if ((peran === null) || !(peranDiizinkan.includes(peran))) {
      next(new ForbiddenError());
      return;
    }

    next();
  };
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export function nonProductionAlert(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== "production") {
    res.set("X-Dev-Env-Alert", "1");
  }
  next();
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
        if (err.id !== undefined) {
          console.error(new Date().toISOString(), `A removed user attempted to access app.${err.id ? ` Id: ${err.id}` : ""}`);
        }
        else {
          console.warn(new Date().toISOString(), `An unknown user attempted to log in.${err.email ? ` Email: ${err.email}` : ""}`);
        }
        break;
      case UnauthenticatedReason.InvalidPassword:
        console.warn(new Date().toISOString(), `User with email "${err.email}" failed to log in due to an invalid password.`);
        break;
    }
  }
  else if (err instanceof ForbiddenError) {
    res.status(403);
    res.json({
      error: "forbidden",
      message: "your role doesn't have access to this",
    });
  }
  else if (err instanceof InvalidCsrfToken) {
    res.status(419);
    res.json({
      error: "expired",
      message: "session expired or invalid csrf token",
    });
  }
  else if (err instanceof TooManyRequestsError) {
    res.status(429);
    res.json({
      error: "too_many_requests",
      message: err.message,
    });
  }
  else if (err instanceof ConflictError) {
    res.status(409);
    res.json([{
      error: "conflict",
      message: `data duplikat pada field '${err.field}'`,
      field: err.field,
    }]);
  }
  else {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
      error: "unknown_error",
      message: err.message,
    });
    console.error(new Date().toISOString(), err);
  }
}
