'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const City = sequelize.define('cities', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  cost_index: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  popularity_badge: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  popularity_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'cities',
});

module.exports = City;
