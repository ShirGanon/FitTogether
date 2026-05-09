const User = require('../models/User');

// GET /api/users — list all users (excluding password)
async function listUsers(req, res, next) {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/search — search users by multiple fields
// Query params: username, fullName, location, fitnessLevel, workoutType
async function searchUsers(req, res, next) {
  try {
    const { username, fullName, location, fitnessLevel, workoutType } = req.query;
    const filter = {};

    if (username) filter.username = { $regex: username, $options: 'i' };
    if (fullName) filter.fullName = { $regex: fullName, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (fitnessLevel) filter.fitnessLevel = fitnessLevel;
    if (workoutType) filter.preferredWorkoutTypes = workoutType;

    const users = await User.find(filter, '-password').sort({ fullName: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id — get one user
async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id, '-password').populate('friends', '-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/:id — update own profile only
async function updateUser(req, res, next) {
  try {
    if (req.params.id !== req.session.userId) {
      return res.status(403).json({ error: 'You can only edit your own profile.' });
    }

    const allowed = ['fullName', 'email', 'bio', 'fitnessLevel', 'preferredWorkoutTypes', 'location'];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id — delete own account only
async function deleteUser(req, res, next) {
  try {
    if (req.params.id !== req.session.userId) {
      return res.status(403).json({ error: 'You can only delete your own account.' });
    }

    await User.findByIdAndDelete(req.params.id);
    req.session.destroy(() => {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/:id/friends — add a friend
async function addFriend(req, res, next) {
  try {
    const userId = req.session.userId;
    const friendId = req.params.id;

    if (userId === friendId) {
      return res.status(400).json({ error: 'You cannot add yourself as a friend.' });
    }

    const friend = await User.findById(friendId);
    if (!friend) return res.status(404).json({ error: 'User not found.' });

    await User.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/:id/friends — remove a friend
async function removeFriend(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.session.userId, { $pull: { friends: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, searchUsers, getUser, updateUser, deleteUser, addFriend, removeFriend };
