'use strict';

const { updateBudgetFields } = require('../services/budget.service');

/**
 * Registers budget-related real-time socket event handlers.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
const registerBudgetSocketHandlers = (io, socket) => {
  socket.on('budget:update', async ({ tripId, budgetData }) => {
    try {
      if (!tripId || !budgetData) {
        return socket.emit('error', { code: 'VALIDATION_ERROR', message: 'tripId and budgetData are required' });
      }

      const budget = await updateBudgetFields(tripId, budgetData);
      // Event is emitted inside budget.service.js, no need to emit again here
    } catch (err) {
      socket.emit('error', { code: 'SERVER_ERROR', message: err.message });
    }
  });
};

module.exports = { registerBudgetSocketHandlers };
