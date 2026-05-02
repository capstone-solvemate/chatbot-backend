export class MintaOtpDto {
  constructor(public email: string) {}
}

export class VerifikasiOtpDto {
  constructor(
    public email: string,
    public otp: string,
  ) {}
}

export class SimpanPasswordDto {
  constructor(
    public resetToken: string,
    public passwordBaru: string,
    public konfirmasiPassword: string,
  ) {}
}
