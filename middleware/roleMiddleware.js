// middleware/roleMiddleware.js
// ─────────────────────────────────────────────
// This middleware checks ROLES after authentication.
// It must always be used AFTER the protect middleware.
//
// Usage in routes:
//   router.get('/admin-only', protect, authorize('admin'), controller)
//   router.get('/organizer-or-admin', protect, authorize('admin', 'organizer'), controller)
// ─────────────────────────────────────────────

// authorize() returns a middleware function
// It accepts any number of allowed roles as arguments
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by protect middleware (which must run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking roles.',
      });
    }

    // Check if the user's role is in the allowed roles list
    const hasPermission = allowedRoles.includes(req.user.role);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route requires one of these roles: [${allowedRoles.join(', ')}]. Your role is: ${req.user.role}`,
      });
    }

    // ✅ User has the right role, proceed
    next();
  };
};

module.exports = { authorize };

