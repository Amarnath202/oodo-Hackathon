'use strict';

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const { generalLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const { configureGoogleOAuth, passport } = require('./config/oauth.config');
const { setupSwagger } = require('./config/swagger.config');
const routes = require('./routes/index');

// Load models and register associations
require('./models/index');

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// ─── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files (Uploads) ───────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Global Rate Limiter ───────────────────────────────────────────────────
app.use('/api/v1', generalLimiter);

// ─── Passport (Google OAuth) ───────────────────────────────────────────────
configureGoogleOAuth();
app.use(passport.initialize());

// ─── Swagger API Docs ──────────────────────────────────────────────────────
setupSwagger(app);

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Traveloop API is running', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: {
      code: 'NOT_FOUND',
      details: 'The requested endpoint does not exist',
    },
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
