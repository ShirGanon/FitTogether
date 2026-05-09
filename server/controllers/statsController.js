const Post = require('../models/Post');

// GET /api/stats/posts-by-workout-type
// Aggregates post count grouped by workoutType. Data comes live from MongoDB.
async function postsByWorkoutType(req, res, next) {
  try {
    const data = await Post.aggregate([
      { $group: { _id: { $ifNull: ['$workoutType', 'General'] }, postCount: { $sum: 1 } } },
      { $project: { workoutType: { $cond: [{ $eq: ['$_id', ''] }, 'General', '$_id'] }, postCount: 1, _id: 0 } },
      { $sort: { postCount: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/stats/posts-by-month
// Aggregates post count per calendar month (YYYY-MM format), sorted ascending.
async function postsByMonth(req, res, next) {
  try {
    const data = await Post.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          postCount: { $sum: 1 },
        },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' },
                ],
              },
            ],
          },
          postCount: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { postsByWorkoutType, postsByMonth };
