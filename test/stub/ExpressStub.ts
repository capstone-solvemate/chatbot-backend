import type { Express, Request, Response } from "express";

import express from "express";
import * as uuid from "uuid";
import { vi } from "vitest";

import type { SesiPengguna } from "~/core/types/SesiPengguna";
import type { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

export function mockExpressRequest(
  options: {
    peranPengguna: PeranPengguna | null;
  } = {
    peranPengguna: null,
  },
) {
  const sesiPengguna: SesiPengguna | undefined = (options.peranPengguna !== null)
    ? {
        csrfToken: uuid.v4().toString(),
        idPengguna: 1,
        peranPengguna: options.peranPengguna,
        sessionId: uuid.v4().toString(),
      }
    : undefined;

  return ({
    sesiPengguna,
  }) as unknown as Request;
}

export function mockExpressResponse() {
  return ({
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    sendStatus: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as unknown as Response;
}

export function buatAppExpress(): Express {
  const app = express();
  app.use(express.json());
  return app;
}
