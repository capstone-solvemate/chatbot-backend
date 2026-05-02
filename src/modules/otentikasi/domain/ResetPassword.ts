export class ResetPassword {
  constructor(
    public id: number,
    public email: string,
    public otp: string | null,
    public resetToken: string | null,
    public otpExpiredPada: Date | null,
    public resetTokenExpiredPada: Date | null,
    public percobaanSalah: number,
    public jumlahPermintaan: number,
    public permintaanPertamaPada: Date | null,
    public dibuatPada: Date,
  ) {}

  otpMasihBerlaku(): boolean {
    if (!this.otp || !this.otpExpiredPada)
      return false;
    return this.otpExpiredPada > new Date();
  }

  resetTokenMasihBerlaku(): boolean {
    if (!this.resetToken || !this.resetTokenExpiredPada)
      return false;
    return this.resetTokenExpiredPada > new Date();
  }

  sudahMelebihiMaksPercobaanSalah(): boolean {
    return this.percobaanSalah >= 3;
  }

  dalamJendalaThrottle(): boolean {
    if (!this.permintaanPertamaPada)
      return false;
    const dua_menit_ms = 2 * 60 * 1000;
    return (new Date().getTime() - this.permintaanPertamaPada.getTime()) < dua_menit_ms;
  }

  sudahMelebihiMaksPermintaan(): boolean {
    return this.jumlahPermintaan >= 3;
  }
}
