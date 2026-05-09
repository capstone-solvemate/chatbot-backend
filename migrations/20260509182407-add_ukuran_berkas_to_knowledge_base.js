"use strict";

const { NAMA_TABEL_KNOWLEDGE_BASE: NAMA_TABEL } = require("./20260507002334-create_tabel_knowledge_base");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(NAMA_TABEL, "ukuran_berkas", {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 0,
      after: "nama_berkas",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(NAMA_TABEL, "ukuran_berkas");
  },
};
