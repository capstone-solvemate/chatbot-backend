"use strict";

const { NAMA_TABEL_CHAT: NAMA_TABEL } = require("./20260503180915-create_tabel_chat.js");
const { NAMA_TABEL_PESAN_CHAT } = require("./20260503180919-create_tabel_pesan_chat.js");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // --- tabel_chat ---
    await queryInterface.addColumn(NAMA_TABEL, "sedang_diproses", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn(NAMA_TABEL, "dialihkan_ke_tiket", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // --- tabel_pesan_chat ---
    await queryInterface.addColumn(NAMA_TABEL_PESAN_CHAT, "gagal", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn(NAMA_TABEL, "sedang_diproses");
    await queryInterface.removeColumn(NAMA_TABEL, "diproses_sejak");
    await queryInterface.removeColumn(NAMA_TABEL, "dialihkan_ke_tiket");
    await queryInterface.removeColumn(NAMA_TABEL_PESAN_CHAT, "gagal");
  },
};
