'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const StopActivity = sequelize.define('stop_activities', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  stop_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  activity_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  scheduled_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
}, {
  timestamps: true,
  updatedAt: false,
  tableName: 'stop_activities',
});

module.exports = StopActivity;
