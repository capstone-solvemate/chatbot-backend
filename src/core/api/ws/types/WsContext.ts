import type { SesiPengguna } from "~/core/types/SesiPengguna";

export type WsContext = {
  sesiPengguna: SesiPengguna | null;
};
