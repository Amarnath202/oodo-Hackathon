# Traveloop Backend

This is the production-grade REST API backend for the Traveloop travel planning platform. It provides endpoints for user authentication, trip management, budgeting, checklists, and more.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Sequelize
- **Authentication:** JWT & Passport.js (Google OAuth2.0)
- **Validation:** Joi
- **Real-time:** Socket.io
- **API Documentation:** Swagger UI

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL server running locally or remotely

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Variables setup:
   Create a `.env` file based on `.env.example` (if provided) or configure the following variables:
   - `PORT=5000`
   - `DB_HOST=localhost`
   - `DB_USER=root`
   - `DB_PASS=yourpassword`
   - `DB_NAME=traveloop`
   - `JWT_SECRET=yoursecret`
   - `GOOGLE_CLIENT_ID=your_client_id`
   - `GOOGLE_CLIENT_SECRET=your_client_secret`
   - `CLIENT_URL=http://localhost:3000`

3. Database Setup:
   Use the provided npm scripts to initialize the database:
   ```bash
   # Create database, run migrations, and seed initial data
   npm run db:init
   ```

### Available Scripts

- `npm start` - Starts the server in production mode
- `npm run dev` - Starts the server in development mode using nodemon
- `npm run db:create` - Creates the database based on config
- `npm run db:migrate` - Runs pending migrations
- `npm run db:seed:all` - Seeds the database with all default data (cities, activities, admin, sample data)
- `npm run db:reset` - Undoes all migrations, migrates anew, and seeds
- `npm run db:init` - Creates DB, migrates, and seeds (all-in-one setup)

## API Documentation

Swagger API documentation is available at the `/api-docs` endpoint once the server is running.
Example: `http://localhost:5000/api-docs`

## Features & Endpoints (Core)

- **Auth**: `/api/v1/auth/*` (Login, Register, OAuth, Password Reset)
- **User**: `/api/v1/users/*` (Profile Management, Saved Destinations)
- **Trips**: `/api/v1/trips/*` (CRUD operations for trips and cover photos)
- **Stops/Itineraries**: `/api/v1/trips/:id/stops`
- **Activities**: `/api/v1/activities/*`
- **Budget**: `/api/v1/trips/:id/budget`
- **Checklist**: `/api/v1/trips/:id/checklist`
- **Notes**: `/api/v1/trips/:id/notes`
- **Share**: `/api/v1/trips/:id/share` (Public sharing of trips)

## License
MIT
