"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("lampiran", "jenis_pesan", {
      type: Sequelize.ENUM("tiket", "pesan_tiket"),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("lampiran", "jenis_pesan", {
      type: Sequelize.ENUM("chat", "tiket"),
      allowNull: false,
    });
  },
};
