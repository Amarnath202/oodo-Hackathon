'use strict';

const { Stop, Activity, StopActivity, City } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Registers stop and activity real-time socket event handlers.
 * These mirror the REST API operations but via WebSocket.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
const registerItinerarySocketHandlers = (io, socket) => {
  // Add a stop via socket
  socket.on('stop:add', async ({ tripId, stopData }) => {
    try {
      if (!tripId || !stopData) {
        return socket.emit('error', { code: 'VALIDATION_ERROR', message: 'tripId and stopData are required' });
      }

      const stop = await Stop.create({
        id: uuidv4(),
        trip_id: tripId,
        city_id: stopData.city_id,
        order_index: stopData.order_index,
        start_date: stopData.start_date,
        end_date: stopData.end_date,
        notes: stopData.notes || null,
      });

      const fullStop = await Stop.findByPk(stop.id, {
        include: [{ model: City, as: 'city' }],
      });

      io.to(`trip:${tripId}`).emit('stop:added', { stop: fullStop });
    } catch (err) {
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });

  // Update a stop via socket
  socket.on('stop:update', async ({ tripId, stopId, data }) => {
    try {
      const stop = await Stop.findByPk(stopId);
      if (!stop || stop.trip_id !== tripId) {
        return socket.emit('error', { code: 'NOT_FOUND', message: 'Stop not found' });
      }

      await stop.update(data);
      const updated = await Stop.findByPk(stopId, {
        include: [{ model: City, as: 'city' }],
      });

      io.to(`trip:${tripId}`).emit('stop:updated', { stop: updated });
    } catch (err) {
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });

  // Delete a stop via socket
  socket.on('stop:delete', async ({ tripId, stopId }) => {
    try {
      const stop = await Stop.findByPk(stopId);
      if (!stop || stop.trip_id !== tripId) {
        return socket.emit('error', { code: 'NOT_FOUND', message: 'Stop not found' });
      }

      await stop.destroy();
      io.to(`trip:${tripId}`).emit('stop:deleted', { stopId });
    } catch (err) {
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });

  // Reorder stops via socket
  socket.on('stop:reorder', async ({ tripId, newOrder }) => {
    try {
      if (!Array.isArray(newOrder)) {
        return socket.emit('error', { code: 'VALIDATION_ERROR', message: 'newOrder must be an array' });
      }

      await Promise.all(
        newOrder.map(({ id, order_index }) =>
          Stop.update({ order_index }, { where: { id, trip_id: tripId } })
        )
      );

      io.to(`trip:${tripId}`).emit('stop:reordered', { order: newOrder });
    } catch (err) {
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });

  // Add activity to a stop via socket
  socket.on('activity:add', async ({ stopId, activityId, scheduledTime }) => {
    try {
      const stop = await Stop.findByPk(stopId);
      if (!stop) {
        return socket.emit('error', { code: 'NOT_FOUND', message: 'Stop not found' });
      }

      const existing = await StopActivity.findOne({ where: { stop_id: stopId, activity_id: activityId } });
      if (existing) {
        return socket.emit('error', { code: 'ALREADY_EXISTS', message: 'Activity already added to this stop' });
      }

      await StopActivity.create({
        id: uuidv4(),
        stop_id: stopId,
        activity_id: activityId,
        scheduled_time: scheduledTime || null,
      });

      const activity = await Activity.findByPk(activityId);
      io.to(`trip:${stop.trip_id}`).emit('activity:added', { stopId, activity });
    } catch (err) {
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });

  // Remove activity from a stop via socket
  socket.on('activity:remove', async ({ stopId, activityId }) => {
    try {
      const stop = await Stop.findByPk(stopId);
      if (!stop) {
        return socket.emit('error', { code: 'NOT_FOUND', message: 'Stop not found' });
      }

      await StopActivity.destroy({ where: { stop_id: stopId, activity_id: activityId } });
      io.to(`trip:${stop.trip_id}`).emit('activity:removed', { stopId, activityId });
    } catch (err) {
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });
};

module.exports = { registerItinerarySocketHandlers };
