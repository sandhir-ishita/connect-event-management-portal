// models/User.js
// ─────────────────────────────────────────────
// This is the MongoDB schema (blueprint) for a User.
// Mongoose uses this to create/validate documents in the DB.
// ─────────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the shape of a User document
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,          // removes extra spaces
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,        // no two users can share an email
      lowercase: true,     // always store as lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,       // ⚠️ IMPORTANT: password won't appear in query results by default
    },

    role: {
      type: String,
      enum: {
        values: ['student', 'organizer', 'admin'],
        message: 'Role must be student, organizer, or admin',
      },
      default: 'student',  // new users are students unless specified
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt fields
  }
);

// ─────────────────────────────────────────────
// PRE-SAVE HOOK: Hash password before saving
// This runs automatically before every .save() call
// ─────────────────────────────────────────────
UserSchema.pre('save', async function () {
  // Only hash if password was changed (avoid re-hashing on profile updates)
  if (!this.isModified('password')) return;

  // bcrypt generates a "salt" (random noise) and hashes the password
  // Salt rounds = 12 means it runs 2^12 = 4096 iterations (very secure)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

});

// ─────────────────────────────────────────────
// INSTANCE METHOD: Compare password during login
// Called as: user.comparePassword(enteredPassword)
// ─────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare hashes the entered password and compares with stored hash
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
