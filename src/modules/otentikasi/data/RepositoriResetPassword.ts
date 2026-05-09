import type { Model, ModelStatic } from "sequelize";

import type { ResetPassword } from "../domain/ResetPassword.js";

import { modelToResetPassword } from "./model/converters.js";

export class RepositoriResetPassword {
  constructor(
    private readonly modelResetPassword: ModelStatic<Model<any, any>>,
  ) {}

  async getByEmail(email: string): Promise<ResetPassword | null> {
    const model = await this.modelResetPassword.findOne({ where: { email } });
    if (!model)
      return null;
    return modelToResetPassword(model);
  }

  async getByResetToken(resetToken: string): Promise<ResetPassword | null> {
    const model = await this.modelResetPassword.findOne({ where: { reset_token: resetToken } });
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
    await this.modelResetPassword.upsert({
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
    await this.modelResetPassword.update({
      otp: null,
      otp_expired_pada: null,
      reset_token: resetToken,
      reset_token_expired_pada: resetTokenExpiredPada,
      percobaan_salah: 0,
    }, { where: { email } });
  }

  async incrementPercobaanSalah(email: string): Promise<void> {
    await this.modelResetPassword.increment("percobaan_salah", { where: { email } });
  }

  async hapusByEmail(email: string): Promise<void> {
    await this.modelResetPassword.destroy({ where: { email } });
  }
}
