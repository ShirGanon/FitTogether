const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { getConversation, searchMessages, markRead, updateMessage, deleteMessage, getUnreadCounts } = require('../controllers/messageController');

router.get('/unread-counts', requireAuth, getUnreadCounts);
router.get('/conversation/:userId', requireAuth, getConversation);
router.get('/search', requireAuth, searchMessages);
router.put('/:id/read', requireAuth, markRead);
router.put('/:id', requireAuth, updateMessage);
router.delete('/:id', requireAuth, deleteMessage);

module.exports = router;
