const FitnessGroup = require('../models/FitnessGroup');

// POST /api/groups — create a new group; creator becomes manager and first member.
async function createGroup(req, res, next) {
  try {
    const { name, description, workoutType, location, difficultyLevel, isPrivate } = req.body;
    if (!name || !workoutType) {
      return res.status(400).json({ error: 'name and workoutType are required.' });
    }

    const group = await FitnessGroup.create({
      name,
      description,
      workoutType,
      location,
      difficultyLevel,
      isPrivate: !!isPrivate,
      managerId: req.session.userId,
      members: [req.session.userId],
    });
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
}

// GET /api/groups — list all groups so users can discover private ones and request access.
async function listGroups(req, res, next) {
  try {
    const groups = await FitnessGroup.find({})
      .populate('managerId', 'username fullName')
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    next(err);
  }
}

// GET /api/groups/search — advanced search with up to 5 params.
async function searchGroups(req, res, next) {
  try {
    const { name, workoutType, location, difficultyLevel, isPrivate } = req.query;
    const userId = req.session.userId;
    const filter = {};

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (workoutType) filter.workoutType = workoutType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (difficultyLevel) filter.difficultyLevel = difficultyLevel;
    if (isPrivate !== undefined && isPrivate !== '') {
      filter.isPrivate = isPrivate === 'true';
    }

    const groups = await FitnessGroup.find(filter)
      .populate('managerId', 'username fullName')
      .sort({ name: 1 });
    res.json(groups);
  } catch (err) {
    next(err);
  }
}

// GET /api/groups/:id — get one group.
// Private group non-members only receive basic info, no members list.
async function getGroup(req, res, next) {
  try {
    const group = await FitnessGroup.findById(req.params.id)
      .populate('managerId', 'username fullName')
      .populate('members', 'username fullName')
      .populate('pendingRequests', 'username fullName');

    if (!group) return res.status(404).json({ error: 'Group not found.' });

    const userId = req.session.userId;
    const isMember = group.members.some((m) => m._id.toString() === userId);
    const isManager = group.managerId._id.toString() === userId;

    if (group.isPrivate && !isMember && !isManager) {
      const hasPending = group.pendingRequests.some((r) => r._id.toString() === userId);
      return res.json({
        _id: group._id,
        name: group.name,
        description: group.description,
        workoutType: group.workoutType,
        location: group.location,
        difficultyLevel: group.difficultyLevel,
        isPrivate: true,
        managerId: group.managerId,
        memberCount: group.members.length,
        isMember: false,
        isManager: false,
        hasPending,
      });
    }

    res.json({ ...group.toObject(), isMember, isManager });
  } catch (err) {
    next(err);
  }
}

// PUT /api/groups/:id — manager only (enforced by isGroupManager middleware).
async function updateGroup(req, res, next) {
  try {
    const allowed = ['name', 'description', 'workoutType', 'location', 'difficultyLevel', 'isPrivate'];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const group = await FitnessGroup.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('managerId', 'username fullName');

    res.json(group);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/groups/:id — manager only.
async function deleteGroup(req, res, next) {
  try {
    await FitnessGroup.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/groups/:id/join — join a public group.
async function joinGroup(req, res, next) {
  try {
    const group = await FitnessGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found.' });
    if (group.isPrivate) return res.status(403).json({ error: 'This group is private. Send a join request instead.' });

    await FitnessGroup.findByIdAndUpdate(req.params.id, {
      $addToSet: { members: req.session.userId },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/groups/:id/request — request to join a private group.
async function requestJoin(req, res, next) {
  try {
    const group = await FitnessGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found.' });
    if (!group.isPrivate) return res.status(400).json({ error: 'This group is public. Join directly.' });

    const userId = req.session.userId;
    if (group.members.map(String).includes(userId)) {
      return res.status(400).json({ error: 'You are already a member.' });
    }

    await FitnessGroup.findByIdAndUpdate(req.params.id, {
      $addToSet: { pendingRequests: userId },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/groups/:id/approve/:userId — manager approves a pending request.
async function approveRequest(req, res, next) {
  try {
    await FitnessGroup.findByIdAndUpdate(req.params.id, {
      $pull: { pendingRequests: req.params.userId },
      $addToSet: { members: req.params.userId },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/groups/:id/reject/:userId — manager rejects a pending request.
async function rejectRequest(req, res, next) {
  try {
    await FitnessGroup.findByIdAndUpdate(req.params.id, {
      $pull: { pendingRequests: req.params.userId },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/groups/:id/members/:userId — manager removes a member.
async function removeMember(req, res, next) {
  try {
    const group = await FitnessGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found.' });
    if (group.managerId.toString() === req.params.userId) {
      return res.status(400).json({ error: 'Cannot remove the group manager.' });
    }

    await FitnessGroup.findByIdAndUpdate(req.params.id, {
      $pull: { members: req.params.userId },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createGroup, listGroups, searchGroups, getGroup,
  updateGroup, deleteGroup, joinGroup, requestJoin,
  approveRequest, rejectRequest, removeMember,
};
