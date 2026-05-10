'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const RefreshToken = sequelize.define('refresh_tokens', {
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
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'refresh_tokens',
});

module.exports = RefreshToken;
