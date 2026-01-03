import mongoose, { Document, Schema } from 'mongoose';

export interface IMealItem {
  name: string;
  amount: number;
  unit: string;
  calories: number;
}

export interface IScanData {
  confidence: number;
  detectedFoods: string[];
  aiAnalysis: string;
}

export interface IMeal extends Document {
  userId: mongoose.Types.ObjectId;
  mealType: 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner';
  name: string;
  date: Date;

  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;

  items?: IMealItem[];
  imageUrl?: string;
  scanData?: IScanData;
  notes?: string;

  // Offline sync support
  clientId?: string;
  syncStatus: 'synced' | 'pending' | 'conflict';

  createdAt: Date;
  updatedAt: Date;
}

const MealSchema = new Schema<IMeal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
    },
    fat: {
      type: Number,
      required: true,
      min: 0,
    },
    fiber: {
      type: Number,
      min: 0,
    },
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
        calories: {
          type: Number,
          required: true,
        },
      },
    ],
    imageUrl: String,
    scanData: {
      confidence: Number,
      detectedFoods: [String],
      aiAnalysis: String,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    clientId: {
      type: String,
      unique: true,
      sparse: true,
    },
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

// Compound index for efficient queries
MealSchema.index({ userId: 1, date: -1 });
MealSchema.index({ userId: 1, syncStatus: 1 });

export default mongoose.model<IMeal>('Meal', MealSchema);
