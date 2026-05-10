'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const hashedPassword = await bcrypt.hash('Admin@Traveloop1', 12);

    await queryInterface.bulkInsert('users', [{
      id: uuidv4(),
      name: 'Traveloop Admin',
      email: 'admin@traveloop.com',
      password: hashedPassword,
      google_id: null,
      profile_photo: null,
      language_preference: 'en',
      role: 'admin',
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    }], {});

    console.log('[Seeder] Admin user created: admin@traveloop.com / Admin@Traveloop1');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@traveloop.com' }, {});
  },
};
