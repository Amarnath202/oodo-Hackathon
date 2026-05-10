'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Traveloop API',
      version: '1.0.0',
      description:
        'Production-grade REST API for Traveloop — a personalized, real-time, collaborative travel planning platform.',
      contact: {
        name: 'Traveloop Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Registers Swagger UI at /api/docs.
 * @param {object} app - Express app
 */
const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Traveloop API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
  }));

  // Also expose raw JSON spec
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('[Swagger] API docs available at /api/docs');
};

module.exports = { setupSwagger };
