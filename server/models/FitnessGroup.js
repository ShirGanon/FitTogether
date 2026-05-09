const mongoose = require('mongoose');

const fitnessGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    workoutType: {
      type: String,
      enum: ['Running', 'Gym', 'Yoga', 'CrossFit', 'Cycling', 'Swimming', 'Home Workout', 'Other'],
      required: true,
    },
    location: { type: String, default: '' },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    isPrivate: { type: Boolean, default: false },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('FitnessGroup', fitnessGroupSchema);
