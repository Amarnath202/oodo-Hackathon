'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/db.config');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const hashedPassword = await bcrypt.hash('User@Traveloop1', 12);

    // Get city IDs
    const [cities] = await sequelize.query('SELECT id, name FROM cities');
    const cityMap = {};
    cities.forEach((c) => { cityMap[c.name] = c.id; });

    // Create a sample user
    const userId = uuidv4();
    await queryInterface.bulkInsert('users', [{
      id: userId,
      name: 'Alex Explorer',
      email: 'alex@traveloop.com',
      password: hashedPassword,
      google_id: null,
      profile_photo: null,
      language_preference: 'en',
      role: 'user',
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    }]);

    // ─── Trip 1: Japan Adventure ─────────────────────────────────────────
    const trip1Id = uuidv4();
    await queryInterface.bulkInsert('trips', [{
      id: trip1Id,
      user_id: userId,
      name: 'Japan Adventure 2025',
      description: 'A 2-week journey through the best of Japan — from buzzing Tokyo to serene Kyoto.',
      cover_photo: null,
      start_date: '2025-03-15',
      end_date: '2025-03-29',
      is_public: true,
      public_slug: 'japan-adventure-2025-alex',
      total_budget: 0,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    }]);

    // Stops for Trip 1
    const stop1Id = uuidv4();
    const stop2Id = uuidv4();

    if (cityMap['Tokyo'] && cityMap['Kyoto']) {
      await queryInterface.bulkInsert('stops', [
        { id: stop1Id, trip_id: trip1Id, city_id: cityMap['Tokyo'], order_index: 0, start_date: '2025-03-15', end_date: '2025-03-20', notes: 'Get JR Pass, explore Shibuya and Harajuku first day', createdAt: now, updatedAt: now },
        { id: stop2Id, trip_id: trip1Id, city_id: cityMap['Kyoto'], order_index: 1, start_date: '2025-03-21', end_date: '2025-03-29', notes: 'Book Fushimi Inari early morning to avoid crowds', createdAt: now, updatedAt: now },
      ]);
    }

    // Budget for Trip 1
    await queryInterface.bulkInsert('budgets', [{
      id: uuidv4(),
      trip_id: trip1Id,
      transport_cost: 70,550.00,
      stay_cost: 99,600.00,
      activity_cost: 0,
      meal_cost: 49,800.00,
      total_cost: 2,20,000.00,
      budget_limit: 2,90,500.00,
      is_over_budget: false,
      createdAt: now,
      updatedAt: now,
    }]);

    // Checklist for Trip 1
    const checklist1Id = uuidv4();
    await queryInterface.bulkInsert('checklists', [{ id: checklist1Id, trip_id: trip1Id, createdAt: now, updatedAt: now }]);
    await queryInterface.bulkInsert('checklist_items', [
      { id: uuidv4(), checklist_id: checklist1Id, name: 'JR Pass', category: 'documents', is_packed: false, createdAt: now, updatedAt: now },
      { id: uuidv4(), checklist_id: checklist1Id, name: 'Passport', category: 'documents', is_packed: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), checklist_id: checklist1Id, name: 'Power adapter (Type A)', category: 'electronics', is_packed: false, createdAt: now, updatedAt: now },
      { id: uuidv4(), checklist_id: checklist1Id, name: 'Comfortable walking shoes', category: 'clothing', is_packed: false, createdAt: now, updatedAt: now },
    ]);

    // Notes for Trip 1
    await queryInterface.bulkInsert('notes', [
      { id: uuidv4(), trip_id: trip1Id, stop_id: stop1Id, content: 'Best ramen in Tokyo: Ichiran Ramen in Shibuya. Get there before noon!', createdAt: now, updatedAt: now },
      { id: uuidv4(), trip_id: trip1Id, stop_id: null, content: 'Download Google Translate Japanese camera mode before trip.', createdAt: now, updatedAt: now },
    ]);

    // ─── Trip 2: European Dream ───────────────────────────────────────────
    const trip2Id = uuidv4();
    await queryInterface.bulkInsert('trips', [{
      id: trip2Id,
      user_id: userId,
      name: 'European Dream Summer',
      description: 'Paris, Rome, and Barcelona — the ultimate European summer itinerary.',
      cover_photo: null,
      start_date: '2025-07-10',
      end_date: '2025-07-24',
      is_public: false,
      public_slug: null,
      total_budget: 0,
      is_deleted: false,
      createdAt: now,
      updatedAt: now,
    }]);

    // Stops for Trip 2
    if (cityMap['Paris'] && cityMap['Rome'] && cityMap['Barcelona']) {
      await queryInterface.bulkInsert('stops', [
        { id: uuidv4(), trip_id: trip2Id, city_id: cityMap['Paris'], order_index: 0, start_date: '2025-07-10', end_date: '2025-07-14', notes: 'Buy skip-the-line tickets for Eiffel and Louvre in advance', createdAt: now, updatedAt: now },
        { id: uuidv4(), trip_id: trip2Id, city_id: cityMap['Rome'], order_index: 1, start_date: '2025-07-15', end_date: '2025-07-19', notes: 'Book Colosseum night tour for best experience', createdAt: now, updatedAt: now },
        { id: uuidv4(), trip_id: trip2Id, city_id: cityMap['Barcelona'], order_index: 2, start_date: '2025-07-20', end_date: '2025-07-24', notes: 'Book Sagrada Família tickets at least 2 weeks ahead', createdAt: now, updatedAt: now },
      ]);
    }

    await queryInterface.bulkInsert('budgets', [{
      id: uuidv4(),
      trip_id: trip2Id,
      transport_cost: 1200.00,
      stay_cost: 2100.00,
      activity_cost: 0,
      meal_cost: 900.00,
      total_cost: 4200.00,
      budget_limit: 5000.00,
      is_over_budget: false,
      createdAt: now,
      updatedAt: now,
    }]);

    const checklist2Id = uuidv4();
    await queryInterface.bulkInsert('checklists', [{ id: checklist2Id, trip_id: trip2Id, createdAt: now, updatedAt: now }]);
    await queryInterface.bulkInsert('checklist_items', [
      { id: uuidv4(), checklist_id: checklist2Id, name: 'Travel insurance', category: 'documents', is_packed: false, createdAt: now, updatedAt: now },
      { id: uuidv4(), checklist_id: checklist2Id, name: 'Euro currency', category: 'documents', is_packed: false, createdAt: now, updatedAt: now },
    ]);

    console.log('[Seeder] Sample trips, stops, budgets, and checklists inserted');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'alex@traveloop.com' }, {});
  },
};
