'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Budget = sequelize.define('budgets', {
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
  transport_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  stay_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  activity_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  meal_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  budget_limit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  is_over_budget: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'budgets',
});

module.exports = Budget;
