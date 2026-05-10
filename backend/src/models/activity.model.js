'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Activity = sequelize.define('activities', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  city_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('sightseeing', 'food', 'adventure', 'shopping', 'culture', 'wellness'),
    allowNull: false,
  },
  cost: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'activities',
});

module.exports = Activity;
