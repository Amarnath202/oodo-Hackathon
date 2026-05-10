'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const PasswordResetToken = sequelize.define('password_reset_tokens', {
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
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  updatedAt: false,
  tableName: 'password_reset_tokens',
});

module.exports = PasswordResetToken;
