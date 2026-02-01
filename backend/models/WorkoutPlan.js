const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number },
  reps: { type: Number },
  duration: { type: Number },
  instructions: { type: String },
});

const dailyWorkoutSchema = new mongoose.Schema({
  dayOfWeek: { type: String, required: true },
  focus: { type: String },
  exercises: [workoutExerciseSchema],
});

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    dailyWorkouts: [dailyWorkoutSchema],
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
module.exports = WorkoutPlan;
