'use strict';

require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/db.config');
const { initSocket } = require('./src/config/socket.config');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MySQL
    await connectDB();

    // 2. Create HTTP server
    const httpServer = http.createServer(app);

    // 3. Initialize Socket.io
    initSocket(httpServer);

    // 4. Start listening
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Traveloop API running on port ${PORT}`);
      console.log(`📖 API Docs:    http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health:     http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
      httpServer.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
};

startServer();
