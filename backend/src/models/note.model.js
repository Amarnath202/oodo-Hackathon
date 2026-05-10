'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Note = sequelize.define('notes', {
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
  stop_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'notes',
});

module.exports = Note;
