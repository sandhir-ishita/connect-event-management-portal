// routes/authRoutes.js
// ─────────────────────────────────────────────
// Routes define the API endpoints and connect them to controllers.
// Think of routes as a "phone directory" — they map URLs to functions.
// ─────────────────────────────────────────────

const express = require('express');
const router = express.Router();

// Import controller functions
const { register, login, getMe } = require('../controllers/authControllers');

// Import middleware
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// ── Public Routes (no authentication needed) ──
router.post('/register', register);   // POST /api/auth/register
router.post('/login', login);         // POST /api/auth/login

// ── Protected Routes (JWT required) ──
router.get('/me', protect, getMe);    // GET /api/auth/me

// ── Example: Role-Protected Route ──
// Only admins can access this route
router.get('/admin-dashboard', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: `Welcome to the Admin Dashboard, ${req.user.name}!`,
    data: { totalUsers: 150, totalEvents: 30 },
  });
});

// Only organizers and admins can access this
router.get('/create-event-panel', protect, authorize('organizer', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: `Welcome, ${req.user.name}! You can create events.`,
  });
});

module.exports = router;
