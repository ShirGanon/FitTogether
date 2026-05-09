// Reusable Express middleware that blocks unauthenticated requests.
// Controllers that require a logged-in user should list this as their first middleware.

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in.' });
  }
  next();
}

module.exports = { requireAuth };
