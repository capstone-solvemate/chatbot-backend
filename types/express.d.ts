import type { SesiPengguna } from "../src/core/types/SesiPengguna.js";

declare global {
  namespace Express {
    interface Request {
      sesiPengguna?: SesiPengguna;
    }
  }
}
