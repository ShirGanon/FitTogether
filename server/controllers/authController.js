const User = require('../models/User');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { username, password, fullName, email, bio, fitnessLevel, preferredWorkoutTypes, location } = req.body;

    if (!username || !password || !fullName || !email) {
      return res.status(400).json({ error: 'username, password, fullName, and email are required.' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      const field = existing.username === username ? 'Username' : 'Email';
      return res.status(400).json({ error: `${field} is already taken.` });
    }

    const user = await User.create({
      username,
      password,
      fullName,
      email,
      bio,
      fitnessLevel,
      preferredWorkoutTypes: preferredWorkoutTypes || [],
      location,
    });

    req.session.userId = user._id.toString();
    res.status(201).json(user.toSafeObject());
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    req.session.userId = user._id.toString();
    res.json(user.toSafeObject());
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('fittogether.sid');
    res.json({ ok: true });
  });
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not logged in.' });
    }
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Session user no longer exists.' });
    }
    res.json(user.toSafeObject());
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe };
