const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { postsByWorkoutType, postsByMonth } = require('../controllers/statsController');

router.get('/posts-by-workout-type', requireAuth, postsByWorkoutType);
router.get('/posts-by-month', requireAuth, postsByMonth);

module.exports = router;
