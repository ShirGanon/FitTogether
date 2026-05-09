const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'FitnessGroup', required: true },
    content: { type: String, required: true, trim: true },
    postType: {
      type: String,
      enum: ['Question', 'Tip', 'Workout Plan', 'Looking for Partner', 'Progress Update', 'Event'],
      default: 'Question',
    },
    workoutType: { type: String, default: '' },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', ''],
      default: '',
    },
    location: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
