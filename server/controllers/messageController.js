const mongoose = require('mongoose');
const Message = require('../models/Message');

// GET /api/messages/conversation/:userId — load history between current user and another.
async function getConversation(req, res, next) {
  try {
    const me = req.session.userId;
    const other = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: me, receiverId: other },
        { senderId: other, receiverId: me },
      ],
    })
      .populate('senderId', 'username fullName')
      .populate('receiverId', 'username fullName')
      .sort({ createdAt: 1 });

    // Mark received messages as read.
    await Message.updateMany(
      { senderId: other, receiverId: me, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (err) {
    next(err);
  }
}

// GET /api/messages/search — search messages by content / sender / date range.
async function searchMessages(req, res, next) {
  try {
    const me = req.session.userId;
    const { content, userId, dateFrom, dateTo } = req.query;

    // Only search messages where current user is a participant.
    const filter = {
      $or: [{ senderId: me }, { receiverId: me }],
    };

    if (content) filter.content = { $regex: content, $options: 'i' };
    if (userId) {
      filter.$or = [
        { senderId: me, receiverId: userId },
        { senderId: userId, receiverId: me },
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo + 'T23:59:59');
    }

    const messages = await Message.find(filter)
      .populate('senderId', 'username fullName')
      .populate('receiverId', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(messages);
  } catch (err) {
    next(err);
  }
}

// PUT /api/messages/:id/read — mark a message as read.
async function markRead(req, res, next) {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found.' });
    if (message.receiverId.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'You can only mark your own received messages as read.' });
    }
    message.isRead = true;
    await message.save();
    res.json(message);
  } catch (err) {
    next(err);
  }
}

// PUT /api/messages/:id — sender can edit the content of their own messages.
async function updateMessage(req, res, next) {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty.' });
    }
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found.' });
    if (message.senderId.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'You can only edit your own messages.' });
    }
    message.content = content.trim();
    await message.save();
    res.json(message);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/messages/:id — sender can delete their own messages.
async function deleteMessage(req, res, next) {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found.' });
    if (message.senderId.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'You can only delete your own messages.' });
    }
    await Message.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/messages/unread-counts — returns { [senderId]: count } for unread messages.
async function getUnreadCounts(req, res, next) {
  try {
    const me = new mongoose.Types.ObjectId(req.session.userId);
    const rows = await Message.aggregate([
      { $match: { receiverId: me, isRead: false } },
      { $group: { _id: '$senderId', count: { $sum: 1 } } },
    ]);
    const result = {};
    for (const row of rows) result[row._id.toString()] = row.count;
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getConversation, searchMessages, markRead, updateMessage, deleteMessage, getUnreadCounts };
