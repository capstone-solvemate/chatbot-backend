"use strict";

const NAMA_TABEL = "faq";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(NAMA_TABEL, "jumlah_dilihat", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn(NAMA_TABEL, "jumlah_helpful", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // Index untuk query popular FAQs — ORDER BY skor sangat terbantu
    // dengan kedua kolom ini ter-index bersama
    await queryInterface.addIndex(NAMA_TABEL, ["jumlah_dilihat", "jumlah_helpful"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(NAMA_TABEL, ["jumlah_dilihat", "jumlah_helpful"]);
    await queryInterface.removeColumn(NAMA_TABEL, "jumlah_helpful");
    await queryInterface.removeColumn(NAMA_TABEL, "jumlah_dilihat");
  },
};
