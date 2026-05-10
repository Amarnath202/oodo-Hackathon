'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const ChecklistItem = sequelize.define('checklist_items', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  checklist_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(
      'Clothing',
      'Documents',
      'Electronics',
      'Toiletries',
      'Medications',
      'Money',
      'Accessories',
      'Other'
    ),
    allowNull: false,
  },
  is_packed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'checklist_items',
});

module.exports = ChecklistItem;
