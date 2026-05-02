import { ModelResetPassword } from "~/models/ModelResetPassword.js";

import type { ResetPassword } from "../domain/ResetPassword.js";

import { modelToResetPassword } from "./model/converters.js";

export class RepositoriResetPassword {
  private constructor() {}
  static readonly instance = new RepositoriResetPassword();

  async getByEmail(email: string): Promise<ResetPassword | null> {
    const model = await ModelResetPassword.findOne({ where: { email } });
    if (!model)
      return null;
    return modelToResetPassword(model);
  }

  async getByResetToken(resetToken: string): Promise<ResetPassword | null> {
    const model = await ModelResetPassword.findOne({ where: { reset_token: resetToken } });
    if (!model)
      return null;
    return modelToResetPassword(model);
  }

  async upsertPermintaanOtp(data: {
    email: string;
    otp: string;
    otpExpiredPada: Date;
    jumlahPermintaan: number;
    permintaanPertamaPada: Date;
  }): Promise<void> {
    await ModelResetPassword.upsert({
      email: data.email,
      otp: data.otp,
      reset_token: null,
      otp_expired_pada: data.otpExpiredPada,
      reset_token_expired_pada: null,
      percobaan_salah: 0,
      jumlah_permintaan: data.jumlahPermintaan,
      permintaan_pertama_pada: data.permintaanPertamaPada,
      dibuat_pada: new Date(),
    });
  }

  async updateSetelahOtpVerified(email: string, resetToken: string, resetTokenExpiredPada: Date): Promise<void> {
    await ModelResetPassword.update({
      otp: null,
      otp_expired_pada: null,
      reset_token: resetToken,
      reset_token_expired_pada: resetTokenExpiredPada,
      percobaan_salah: 0,
    }, { where: { email } });
  }

  async incrementPercobaanSalah(email: string): Promise<void> {
    await ModelResetPassword.increment("percobaan_salah", { where: { email } });
  }

  async hapusByEmail(email: string): Promise<void> {
    await ModelResetPassword.destroy({ where: { email } });
  }
}
