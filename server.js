// server.js
// ─────────────────────────────────────────────
// This is the ENTRY POINT of the application.
// It wires everything together:
//   - Environment variables
//   - Database connection
//   - Express app setup
//   - Routes
// ─────────────────────────────────────────────

// ── Load environment variables from .env file FIRST ──
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

// ── Initialize Express app ──
const app = express();

// ─────────────────────────────────────────────
// MIDDLEWARE: Global Express Middleware
// These run on EVERY request before hitting routes
// ─────────────────────────────────────────────

// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ── Simple request logger (helpful during development) ──
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─────────────────────────────────────────────
// ROUTES: Mount all route files
// ─────────────────────────────────────────────

// All auth routes will be prefixed with /api/auth
// e.g., POST /api/auth/register, POST /api/auth/login
app.use('/api/auth', require('./routes/authRoutes'));

// ── Health Check Route ──
// Visit http://localhost:5000/ to see if server is running
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎓 College Event Management API is running!',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me',
      adminDashboard: 'GET /api/auth/admin-dashboard',
      createEventPanel: 'GET /api/auth/create-event-panel',
    },
  });
});

// ── 404 Handler: catch undefined routes ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.',
  });
});

// ─────────────────────────────────────────────
// START SERVER
// Connect to DB first, then listen for requests
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(); // Connect to MongoDB

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Test the API at: http://localhost:${PORT}/\n`);
  });
};

startServer();
