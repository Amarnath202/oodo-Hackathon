'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: true },
      google_id: { type: Sequelize.STRING(255), allowNull: true, unique: true },
      profile_photo: { type: Sequelize.STRING(255), allowNull: true },
      language_preference: { type: Sequelize.STRING(10), defaultValue: 'en' },
      role: { type: Sequelize.ENUM('user', 'admin'), defaultValue: 'user' },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Refresh Tokens
    await queryInterface.createTable('refresh_tokens', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      token: { type: Sequelize.TEXT, allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Password Reset Tokens
    await queryInterface.createTable('password_reset_tokens', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      token: { type: Sequelize.STRING(255), allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      is_used: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Cities
    await queryInterface.createTable('cities', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      country: { type: Sequelize.STRING(100), allowNull: false },
      region: { type: Sequelize.STRING(100), allowNull: true },
      cost_index: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      popularity_score: { type: Sequelize.INTEGER, defaultValue: 0 },
      description: { type: Sequelize.TEXT, allowNull: true },
      image_url: { type: Sequelize.STRING(255), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Trips
    await queryInterface.createTable('trips', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(150), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      cover_photo: { type: Sequelize.STRING(255), allowNull: true },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      is_public: { type: Sequelize.BOOLEAN, defaultValue: false },
      public_slug: { type: Sequelize.STRING(255), allowNull: true, unique: true },
      total_budget: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Stops
    await queryInterface.createTable('stops', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      trip_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'trips', key: 'id' }, onDelete: 'CASCADE' },
      city_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'cities', key: 'id' } },
      order_index: { type: Sequelize.INTEGER, allowNull: false },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Activities
    await queryInterface.createTable('activities', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      city_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'cities', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(150), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      type: { type: Sequelize.ENUM('sightseeing', 'food', 'adventure', 'shopping', 'culture', 'wellness'), allowNull: false },
      cost: { type: Sequelize.DECIMAL(8, 2), defaultValue: 0 },
      duration_minutes: { type: Sequelize.INTEGER, allowNull: true },
      image_url: { type: Sequelize.STRING(255), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Stop Activities
    await queryInterface.createTable('stop_activities', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      stop_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'stops', key: 'id' }, onDelete: 'CASCADE' },
      activity_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'activities', key: 'id' }, onDelete: 'CASCADE' },
      scheduled_time: { type: Sequelize.TIME, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Budgets
    await queryInterface.createTable('budgets', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      trip_id: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'trips', key: 'id' }, onDelete: 'CASCADE' },
      transport_cost: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      stay_cost: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      activity_cost: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      meal_cost: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      total_cost: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      budget_limit: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      is_over_budget: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Checklists
    await queryInterface.createTable('checklists', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      trip_id: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'trips', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Checklist Items
    await queryInterface.createTable('checklist_items', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      checklist_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'checklists', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(150), allowNull: false },
      category: { type: Sequelize.ENUM('clothing', 'documents', 'electronics', 'toiletries', 'other'), allowNull: false },
      is_packed: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Notes
    await queryInterface.createTable('notes', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      trip_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'trips', key: 'id' }, onDelete: 'CASCADE' },
      stop_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'stops', key: 'id' }, onDelete: 'SET NULL' },
      content: { type: Sequelize.TEXT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Saved Destinations
    await queryInterface.createTable('saved_destinations', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      city_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'cities', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('saved_destinations');
    await queryInterface.dropTable('notes');
    await queryInterface.dropTable('checklist_items');
    await queryInterface.dropTable('checklists');
    await queryInterface.dropTable('budgets');
    await queryInterface.dropTable('stop_activities');
    await queryInterface.dropTable('activities');
    await queryInterface.dropTable('stops');
    await queryInterface.dropTable('trips');
    await queryInterface.dropTable('cities');
    await queryInterface.dropTable('password_reset_tokens');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('users');
  },
};
