"use strict";

const NAMA_TABEL = "pengguna";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  NAMA_TABEL_PENGGUNA: NAMA_TABEL,
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(NAMA_TABEL, {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nama: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable(NAMA_TABEL);
  },
};
