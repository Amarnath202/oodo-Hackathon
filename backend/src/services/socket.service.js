'use strict';

/**
 * Emits a socket event to a trip room.
 * @param {string} tripId
 * @param {string} event - Event name
 * @param {*} data - Event payload
 */
const emitToTrip = (tripId, event, data) => {
  try {
    const { getIO } = require('../config/socket.config');
    const io = getIO();
    io.to(`trip:${tripId}`).emit(event, data);
  } catch {
    // Non-fatal if socket not initialized
  }
};

module.exports = { emitToTrip };
