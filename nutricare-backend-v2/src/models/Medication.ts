import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicationSchedule {
  time: string;
  reminderEnabled: boolean;
}

export interface IMedicationLog {
  date: Date;
  taken: boolean;
  time?: Date;
  notes?: string;
}

export interface IMedication extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: string;

  schedule: IMedicationSchedule[];
  startDate: Date;
  endDate?: Date;

  notes?: string;
  sideEffects?: string[];

  logs: IMedicationLog[];
  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
    schedule: [
      {
        time: {
          type: String,
          required: true,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        reminderEnabled: {
          type: Boolean,
          default: true,
        },
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    notes: {
      type: String,
      maxlength: 1000,
    },
    sideEffects: [String],
    logs: [
      {
        date: {
          type: Date,
          required: true,
        },
        taken: {
          type: Boolean,
          required: true,
        },
        time: Date,
        notes: String,
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMedication>('Medication', MedicationSchema);
