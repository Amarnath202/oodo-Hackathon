# Traveloop

Traveloop is a comprehensive travel planning platform designed to help users organize, budget, and track their trips seamlessly. The project is split into a **Frontend** (React) and a **Backend** (Node.js/Express + MySQL).

## Features
- **Authentication**: JWT-based auth and Google OAuth2.0 integration.
- **Trip Management**: Create, edit, and organize complete travel itineraries.
- **Budget Tracking**: Manage trip expenses and budgets efficiently.
- **Checklists & Notes**: Keep track of what to pack and jot down important details.
- **Real-Time Features**: Integrated functionality to make planning smooth and responsive.

## Project Structure

This repository is organized into two main parts:
- `/frontend` - The React-based user interface using Vite.
- `/backend` - The Express.js REST API with a MySQL database.

## Prerequisites

- Node.js (v18+)
- MySQL
- npm or yarn

## Getting Started

To run the application locally, you need to set up both the backend and frontend.

### 1. Backend Setup

Navigate to the backend directory and set up the API:
```bash
cd backend
npm install
```

Configure your environment variables in a `.env` file inside the `backend` folder (e.g. Database credentials, JWT Secret).

Initialize the database (this will create the DB, run migrations, and seed default data):
```bash
npm run db:init
```

Start the backend server in development mode:
```bash
npm run dev
```
The backend will run on `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal window, navigate to the frontend directory, and set up the UI:
```bash
cd frontend
npm install
```

Configure your environment variables in a `.env` file inside the `frontend` folder (e.g., `VITE_API_BASE_URL=http://localhost:5000/api/v1`).

Start the frontend development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:3000` or the port specified by Vite (check terminal output).

## Technologies Used

**Frontend:**
- React (v19)
- Vite
- React Router DOM
- Axios
- React Hook Form & Yup
- Recharts

**Backend:**
- Node.js & Express
- Sequelize ORM
- MySQL2
- JWT & Passport (OAuth)
- Swagger (API Docs)

## License
MIT
Demo link: https://drive.google.com/file/d/1yaCKbCFf61FDGpH54_tl5xQ7rv5-xcrs/view?usp=sharing
