'use strict';

const { Trip } = require('../models');

/**
 * Registers trip-level socket event handlers.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
const registerTripSocketHandlers = (io, socket) => {
  // Join a trip collaboration room
  socket.on('join:trip', async ({ tripId }) => {
    try {
      if (!tripId) {
        return socket.emit('error', { code: 'VALIDATION_ERROR', message: 'tripId is required to join a room' });
      }

      const trip = await Trip.findOne({
        where: { id: tripId, is_deleted: false },
      });

      if (!trip) {
        return socket.emit('error', { code: 'NOT_FOUND', message: 'Trip not found' });
      }

      // Only trip owner (or eventually collaborators) can join
      if (trip.user_id !== socket.user.id && socket.user.role !== 'admin') {
        return socket.emit('error', { code: 'FORBIDDEN', message: 'You do not have access to this trip' });
      }

      socket.join(`trip:${tripId}`);
      socket.emit('joined:trip', { tripId, message: `Joined trip room: ${tripId}` });
      console.log(`[Socket] User ${socket.user.id} joined trip:${tripId}`);
    } catch (err) {
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });

  // Leave a trip room
  socket.on('leave:trip', ({ tripId }) => {
    try {
      if (!tripId) {
        return socket.emit('error', { code: 'VALIDATION_ERROR', message: 'tripId is required' });
      }
      socket.leave(`trip:${tripId}`);
      console.log(`[Socket] User ${socket.user.id} left trip:${tripId}`);
    } catch (err) {
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });
};

module.exports = { registerTripSocketHandlers };
