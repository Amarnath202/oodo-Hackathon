'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Checklist = sequelize.define('checklists', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  trip_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
  tableName: 'checklists',
});

module.exports = Checklist;
