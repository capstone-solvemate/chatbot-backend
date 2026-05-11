"use strict";

const NAMA_TABEL = "tiket";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Index biasa untuk performa query lookup by id_chat
    await queryInterface.addIndex(NAMA_TABEL, ["id_chat"], {
      name: "tiket_id_chat_unique",
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(NAMA_TABEL, "tiket_id_chat_unique");
  },
};
