'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Stop = sequelize.define('stops', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  trip_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  city_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'stops',
});

module.exports = Stop;
