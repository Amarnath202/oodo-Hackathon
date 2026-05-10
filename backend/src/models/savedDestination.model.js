'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const SavedDestination = sequelize.define('saved_destinations', {
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
  city_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  timestamps: true,
  updatedAt: false,
  tableName: 'saved_destinations',
});

module.exports = SavedDestination;
