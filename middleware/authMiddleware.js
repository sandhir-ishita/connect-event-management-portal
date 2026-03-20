// middleware/authMiddleware.js
// ─────────────────────────────────────────────
// This middleware PROTECTS routes.
// It checks if a valid JWT token is present in the request.
// If valid → attaches user data to req.user and calls next()
// If invalid → sends 401 Unauthorized error
// ─────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // ── Step 1: Extract token from Authorization header ──
    // Convention: "Authorization: Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // Get the part after "Bearer "
    }

    // ── Step 2: Check token exists ──
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Please log in.',
      });
    }

    // ── Step 3: Verify the token ──
    // jwt.verify will throw an error if token is expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "user_id", role: "student", iat: ..., exp: ... }

    // ── Step 4: Find the user from the token's payload ──
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user associated with this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    // ── Step 5: Attach user to request object ──
    // All subsequent middleware and controllers can access req.user
    req.user = user;

    next(); // ✅ Token is valid, proceed to the next middleware/controller

  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
    }

    console.error('Auth Middleware Error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

module.exports = { protect };
