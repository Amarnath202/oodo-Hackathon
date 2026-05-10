'use strict';

const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/token.util');
const { registerTripSocketHandlers } = require('../sockets/trip.socket');
const { registerItinerarySocketHandlers } = require('../sockets/itinerary.socket');
const { registerBudgetSocketHandlers } = require('../sockets/budget.socket');

let io;

/**
 * Initializes Socket.io on the HTTP server.
 * Authenticates every connection via JWT middleware.
 * @param {http.Server} httpServer
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT authentication middleware for every socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('UNAUTHORIZED: No token provided'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new Error('TOKEN_EXPIRED: Access token has expired'));
      }
      return next(new Error('TOKEN_INVALID: Invalid access token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user?.id} (socket: ${socket.id})`);

    registerTripSocketHandlers(io, socket);
    registerItinerarySocketHandlers(io, socket);
    registerBudgetSocketHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user?.id}`);
    });
  });

  return io;
};

/**
 * Returns the initialized io instance.
 * @returns {Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket first.');
  }
  return io;
};

module.exports = { initSocket, getIO };
