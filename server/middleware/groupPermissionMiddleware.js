const FitnessGroup = require('../models/FitnessGroup');

// Verifies the logged-in user is the manager of the requested group.
// Attaches req.group so the controller does not need to re-fetch.
async function isGroupManager(req, res, next) {
  try {
    const group = await FitnessGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found.' });
    if (group.managerId.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Only the group manager can do this.' });
    }
    req.group = group;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { isGroupManager };
