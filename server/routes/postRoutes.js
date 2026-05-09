const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  createPost, getFeed, getMyPosts, getGroupPosts, searchPosts, updatePost, deletePost,
} = require('../controllers/postController');

// Specific routes before /:id to avoid conflicts.
router.get('/feed', requireAuth, getFeed);
router.get('/mine', requireAuth, getMyPosts);
router.get('/group/:groupId', requireAuth, getGroupPosts);
router.get('/search', requireAuth, searchPosts);

router.post('/', requireAuth, createPost);
router.put('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, deletePost);

module.exports = router;
