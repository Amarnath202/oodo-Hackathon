'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  google_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  profile_photo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  language_preference: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'users',
});

module.exports = User;
