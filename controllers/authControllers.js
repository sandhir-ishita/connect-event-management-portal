// controllers/authController.js
// ─────────────────────────────────────────────
// Controllers contain the BUSINESS LOGIC.
// They receive (req, res) from routes and process the request.
// ─────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────────
// HELPER: Generate a JWT token for a user
// ─────────────────────────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role },   // PAYLOAD: data embedded in the token
    process.env.JWT_SECRET,        // SECRET: used to sign (don't expose this!)
    { expiresIn: process.env.JWT_EXPIRES_IN } // TOKEN EXPIRY: e.g., "7d"
  );
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (anyone can register)
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // ── Step 1: Validate required fields ──
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // ── Step 2: Check if user already exists ──
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // ── Step 3: Create new user (password hashing happens in the model's pre-save hook) ──
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role || 'student', // Default to student if no role given
    });

    // ── Step 4: Generate JWT token ──
    const token = generateToken(user._id, user.role);

    // ── Step 5: Send response ──
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Mongoose validation errors (e.g., invalid email format)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // ── Step 1: Validate input ──
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // ── Step 2: Find user by email (include password field since select: false) ──
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      // ⚠️ Don't say "email not found" — use vague message to prevent user enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // ── Step 3: Check if account is active ──
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    // ── Step 4: Compare password using our model method ──
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // ── Step 5: Generate token and respond ──
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get logged-in user's profile
// @access  Private (requires JWT)
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the authMiddleware after verifying the token
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
