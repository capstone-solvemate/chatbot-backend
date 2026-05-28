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
    const foreignKeys = await queryInterface.getForeignKeyReferencesForTable(NAMA_TABEL);
    const fkName = foreignKeys
      .find(fk => fk.columnName === "id_chat")
      ?.constraintName;

    if (fkName) {
      await queryInterface.removeConstraint(NAMA_TABEL, fkName);
    }

    await queryInterface.removeIndex(NAMA_TABEL, "tiket_id_chat_unique");

    await queryInterface.addConstraint(NAMA_TABEL, {
      fields: ["id_chat"],
      type: "foreign key",
      name: fkName,
      references: {
        table: "chat",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
};
