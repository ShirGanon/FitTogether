const Post = require('../models/Post');
const FitnessGroup = require('../models/FitnessGroup');
const User = require('../models/User');

// Helper — verify the user is a member of the group.
async function assertMember(groupId, userId) {
  const group = await FitnessGroup.findById(groupId);
  if (!group) throw Object.assign(new Error('Group not found.'), { status: 404 });
  const isMember = group.members.map(String).includes(userId);
  if (!isMember) throw Object.assign(new Error('You must be a group member to post here.'), { status: 403 });
  return group;
}

// POST /api/posts
async function createPost(req, res, next) {
  try {
    const { groupId, content, postType, workoutType, difficultyLevel, location } = req.body;
    if (!groupId || !content) {
      return res.status(400).json({ error: 'groupId and content are required.' });
    }

    await assertMember(groupId, req.session.userId);

    const post = await Post.create({
      authorId: req.session.userId,
      groupId,
      content,
      postType,
      workoutType,
      difficultyLevel,
      location,
    });

    const populated = await Post.findById(post._id)
      .populate('authorId', 'username fullName')
      .populate('groupId', 'name');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

// GET /api/posts/feed — posts from groups the user belongs to + posts from friends.
async function getFeed(req, res, next) {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).select('friends');
    const groups = await FitnessGroup.find({ members: userId }).select('_id');
    const groupIds = groups.map((g) => g._id);

    const posts = await Post.find({
      $or: [{ groupId: { $in: groupIds } }, { authorId: { $in: user.friends } }],
    })
      .populate('authorId', 'username fullName')
      .populate('groupId', 'name isPrivate members')
      .sort({ createdAt: -1 })
      .limit(100);

    // Filter out posts from private groups the user is not a member of.
    const visible = posts.filter((p) => {
      if (!p.groupId.isPrivate) return true;
      return p.groupId.members.map(String).includes(userId);
    });

    res.json(visible);
  } catch (err) {
    next(err);
  }
}

// GET /api/posts/mine — all posts by the current user.
async function getMyPosts(req, res, next) {
  try {
    const posts = await Post.find({ authorId: req.session.userId })
      .populate('authorId', 'username fullName')
      .populate('groupId', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

// GET /api/posts/group/:groupId — posts in a specific group.
async function getGroupPosts(req, res, next) {
  try {
    const group = await FitnessGroup.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found.' });

    const userId = req.session.userId;
    const isMember = group.members.map(String).includes(userId);
    if (group.isPrivate && !isMember) {
      return res.status(403).json({ error: 'You must be a member to view posts in this private group.' });
    }

    const posts = await Post.find({ groupId: req.params.groupId })
      .populate('authorId', 'username fullName')
      .populate('groupId', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

// GET /api/posts/search — advanced search with multiple params.
async function searchPosts(req, res, next) {
  try {
    const { content, postType, workoutType, difficultyLevel, location, dateFrom, dateTo, groupId } = req.query;
    const userId = req.session.userId;

    const filter = {};
    if (content) filter.content = { $regex: content, $options: 'i' };
    if (postType) filter.postType = postType;
    if (workoutType) filter.workoutType = { $regex: workoutType, $options: 'i' };
    if (difficultyLevel) filter.difficultyLevel = difficultyLevel;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (groupId) filter.groupId = groupId;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo + 'T23:59:59');
    }

    const posts = await Post.find(filter)
      .populate('authorId', 'username fullName')
      .populate('groupId', 'name isPrivate members')
      .sort({ createdAt: -1 });

    // Exclude posts from private groups the user is not in.
    const visible = posts.filter((p) => {
      if (!p.groupId?.isPrivate) return true;
      return p.groupId.members.map(String).includes(userId);
    });

    res.json(visible);
  } catch (err) {
    next(err);
  }
}

// PUT /api/posts/:id — author only.
async function updatePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    if (post.authorId.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'You can only edit your own posts.' });
    }

    const allowed = ['content', 'postType', 'workoutType', 'difficultyLevel', 'location'];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('authorId', 'username fullName')
      .populate('groupId', 'name');

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/posts/:id — author or group manager.
async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const userId = req.session.userId;
    const isAuthor = post.authorId.toString() === userId;

    if (!isAuthor) {
      const group = await FitnessGroup.findById(post.groupId);
      const isManager = group && group.managerId.toString() === userId;
      if (!isManager) return res.status(403).json({ error: 'You can only delete your own posts.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { createPost, getFeed, getMyPosts, getGroupPosts, searchPosts, updatePost, deletePost };
