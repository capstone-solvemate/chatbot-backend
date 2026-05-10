"use strict";

const NAMA_TABEL = "pengguna";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(NAMA_TABEL, "is_active", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn(NAMA_TABEL, "is_active");
  },
};
