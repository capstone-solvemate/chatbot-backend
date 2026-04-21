export enum PeranPengguna {
  Karyawan,
  Admin,
}

export function peranPenggunaToString(peran: PeranPengguna): string {
  switch (peran) {
    case PeranPengguna.Karyawan:
      return "karyawan";
    case PeranPengguna.Admin:
      return "admin";
  }
}

export function stringToPeranPengguna(peranStr: string): PeranPengguna | null {
  switch (peranStr.toLowerCase()) {
    case "karyawan":
      return PeranPengguna.Karyawan;
    case "admin":
      return PeranPengguna.Admin;
    default:
      return null;
  }
}
