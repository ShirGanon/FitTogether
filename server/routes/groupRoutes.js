const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { isGroupManager } = require('../middleware/groupPermissionMiddleware');
const {
  createGroup, listGroups, searchGroups, getGroup,
  updateGroup, deleteGroup, joinGroup, requestJoin,
  approveRequest, rejectRequest, removeMember,
} = require('../controllers/groupController');

router.post('/', requireAuth, createGroup);
router.get('/', requireAuth, listGroups);
router.get('/search', requireAuth, searchGroups);
router.get('/:id', requireAuth, getGroup);
router.put('/:id', requireAuth, isGroupManager, updateGroup);
router.delete('/:id', requireAuth, isGroupManager, deleteGroup);

router.post('/:id/join', requireAuth, joinGroup);
router.post('/:id/request', requireAuth, requestJoin);
router.post('/:id/approve/:userId', requireAuth, isGroupManager, approveRequest);
router.post('/:id/reject/:userId', requireAuth, isGroupManager, rejectRequest);
router.delete('/:id/members/:userId', requireAuth, isGroupManager, removeMember);

module.exports = router;
