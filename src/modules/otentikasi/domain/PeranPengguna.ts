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
