"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "João Silva",
          email: "joao@example.com",
          password: hashedPassword,
        },
        {
          name: "Maria Santos",
          email: "maria@example.com",
          password: hashedPassword,
        },
        {
          name: "Pedro Oliveira",
          email: "pedro@example.com",
          password: hashedPassword,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
