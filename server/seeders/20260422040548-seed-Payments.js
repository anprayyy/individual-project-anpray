'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Payments', [
      {
        id: 1,
        userId: 2,
        amount: 50000,
        status: "paid",
        transactionId: "TRX-001",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payments', null, {});
  }
};
