'use strict';

const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        name: "Admin",
        email: "admin@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        role: "Admin",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: "User",
        email: "user@gmail.com",
        password: bcrypt.hashSync("123456", 10),
        role: "User",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
