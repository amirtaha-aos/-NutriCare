import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  waterIntake: number;
  steps?: number;
  sleepHours?: number;
  weight?: number;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  notes?: string;

  // Offline sync
  clientId?: string;
  syncStatus: 'synced' | 'pending' | 'conflict';

  createdAt: Date;
  updatedAt: Date;
}

const HealthLogSchema = new Schema<IHealthLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    waterIntake: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },
    steps: {
      type: Number,
      min: 0,
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    weight: Number,
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'bad', 'terrible'],
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    clientId: String,
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'conflict'],
      default: 'synced',
    },
  },
  {
    timestamps: true,
  }
);

// Unique index to ensure one log per user per day
HealthLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IHealthLog>('HealthLog', HealthLogSchema);
