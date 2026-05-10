'use strict';

/**
 * Central model registry.
 * Imports all models and defines every association in one place.
 * Import this file wherever DB models are needed.
 */

const User = require('./user.model');
const RefreshToken = require('./token.model');
const PasswordResetToken = require('./passwordResetToken.model');
const City = require('./city.model');
const Trip = require('./trip.model');
const Stop = require('./stop.model');
const Activity = require('./activity.model');
const StopActivity = require('./stopActivity.model');
const Budget = require('./budget.model');
const Checklist = require('./checklist.model');
const ChecklistItem = require('./checklistItem.model');
const Note = require('./note.model');
const SavedDestination = require('./savedDestination.model');

// ─── User Associations ─────────────────────────────────────────────────────
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(PasswordResetToken, { foreignKey: 'user_id', as: 'passwordResetTokens', onDelete: 'CASCADE' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Trip, { foreignKey: 'user_id', as: 'trips', onDelete: 'CASCADE' });
Trip.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

User.hasMany(SavedDestination, { foreignKey: 'user_id', as: 'savedDestinations', onDelete: 'CASCADE' });
SavedDestination.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── City Associations ────────────────────────────────────────────────────
City.hasMany(Activity, { foreignKey: 'city_id', as: 'activities', onDelete: 'CASCADE' });
Activity.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

City.hasMany(Stop, { foreignKey: 'city_id', as: 'stops' });
Stop.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

City.hasMany(SavedDestination, { foreignKey: 'city_id', as: 'savedBy', onDelete: 'CASCADE' });
SavedDestination.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

// ─── Trip Associations ─────────────────────────────────────────────────────
Trip.hasMany(Stop, { foreignKey: 'trip_id', as: 'stops', onDelete: 'CASCADE' });
Stop.belongsTo(Trip, { foreignKey: 'trip_id', as: 'trip' });

Trip.hasOne(Budget, { foreignKey: 'trip_id', as: 'budget', onDelete: 'CASCADE' });
Budget.belongsTo(Trip, { foreignKey: 'trip_id', as: 'trip' });

Trip.hasOne(Checklist, { foreignKey: 'trip_id', as: 'checklist', onDelete: 'CASCADE' });
Checklist.belongsTo(Trip, { foreignKey: 'trip_id', as: 'trip' });

Trip.hasMany(Note, { foreignKey: 'trip_id', as: 'notes', onDelete: 'CASCADE' });
Note.belongsTo(Trip, { foreignKey: 'trip_id', as: 'trip' });

// ─── Stop Associations ─────────────────────────────────────────────────────
Stop.hasMany(StopActivity, { foreignKey: 'stop_id', as: 'stopActivities', onDelete: 'CASCADE' });
StopActivity.belongsTo(Stop, { foreignKey: 'stop_id', as: 'stop' });

Stop.hasMany(Note, { foreignKey: 'stop_id', as: 'stopNotes' });
Note.belongsTo(Stop, { foreignKey: 'stop_id', as: 'stop' });

// ─── Activity Associations ─────────────────────────────────────────────────
Activity.hasMany(StopActivity, { foreignKey: 'activity_id', as: 'stopActivities', onDelete: 'CASCADE' });
StopActivity.belongsTo(Activity, { foreignKey: 'activity_id', as: 'activity' });

// ─── M2M: Stop <-> Activity via StopActivity ──────────────────────────────
Stop.belongsToMany(Activity, {
  through: StopActivity,
  foreignKey: 'stop_id',
  otherKey: 'activity_id',
  as: 'activities',
});
Activity.belongsToMany(Stop, {
  through: StopActivity,
  foreignKey: 'activity_id',
  otherKey: 'stop_id',
  as: 'stops',
});

// ─── Checklist Associations ────────────────────────────────────────────────
Checklist.hasMany(ChecklistItem, { foreignKey: 'checklist_id', as: 'items', onDelete: 'CASCADE' });
ChecklistItem.belongsTo(Checklist, { foreignKey: 'checklist_id', as: 'checklist' });

module.exports = {
  User,
  RefreshToken,
  PasswordResetToken,
  City,
  Trip,
  Stop,
  Activity,
  StopActivity,
  Budget,
  Checklist,
  ChecklistItem,
  Note,
  SavedDestination,
};
