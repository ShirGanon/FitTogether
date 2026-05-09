const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  listUsers,
  searchUsers,
  getUser,
  updateUser,
  deleteUser,
  addFriend,
  removeFriend,
} = require('../controllers/userController');

router.get('/', requireAuth, listUsers);
router.get('/search', requireAuth, searchUsers);
router.get('/:id', requireAuth, getUser);
router.put('/:id', requireAuth, updateUser);
router.delete('/:id', requireAuth, deleteUser);
router.post('/:id/friends', requireAuth, addFriend);
router.delete('/:id/friends', requireAuth, removeFriend);

module.exports = router;
