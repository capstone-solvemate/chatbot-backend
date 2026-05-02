"use strict";

const NAMA_TABEL = "reset_password";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      otp: {
        type: Sequelize.STRING(6),
        allowNull: true,
      },

      reset_token: {
        type: Sequelize.STRING(36),
        allowNull: true,
        unique: true,
      },

      otp_expired_pada: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      reset_token_expired_pada: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      percobaan_salah: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      jumlah_permintaan: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      permintaan_pertama_pada: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      dibuat_pada: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(NAMA_TABEL, ["email"]);
    await queryInterface.addIndex(NAMA_TABEL, ["reset_token"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
