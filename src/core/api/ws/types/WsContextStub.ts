import { PeranPengguna } from "~/modules/pengguna/domain/PeranPengguna";

import type { WsContext } from "./WsContext.js";

export function buatContohWsContext(): WsContext {
  return {
    sesiPengguna: {
      csrfToken: "token",
      idPengguna: 2,
      peranPengguna: PeranPengguna.Karyawan,
      sessionId: "test",
    },
  };
}
