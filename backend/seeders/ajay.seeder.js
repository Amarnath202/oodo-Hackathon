'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const hashedPassword = await bcrypt.hash('Ajay@Traveloop1', 12);

    await queryInterface.bulkInsert('users', [{
      id: uuidv4(),
      name: 'Ajay',
      email: 'ajay@traveloop.com',
      password: hashedPassword,
      google_id: null,
      profile_photo: null,
      language_preference: 'en',
      role: 'user',
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    }]);

    console.log('[Seeder] User created: ajay@traveloop.com / Ajay@Traveloop1');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'ajay@traveloop.com' }, {});
  },
};
