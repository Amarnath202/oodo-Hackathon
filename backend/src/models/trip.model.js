'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Trip = sequelize.define('trips', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
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
  cover_photo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  cover_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  public_slug: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  total_budget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'trips',
});

module.exports = Trip;
