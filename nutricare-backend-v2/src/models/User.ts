import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IDeviceToken {
  token: string;
  platform: 'android' | 'ios';
  deviceId: string;
  lastUsed: Date;
}

export interface INotificationPreferences {
  waterReminders: boolean;
  mealReminders: boolean;
  medicationReminders: boolean;
  progressUpdates: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'patient' | 'nutritionist' | 'admin';

  healthData: {
    weight?: number;
    height?: number;
    targetWeight?: number;
    birthDate?: Date;
    gender?: 'male' | 'female';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    dailyCalorieGoal?: number;
    allergies?: string[];
    medicalConditions?: string[];
  };

  deviceTokens: IDeviceToken[];
  notificationPreferences: INotificationPreferences;
  lastSync?: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['patient', 'nutritionist', 'admin'],
      default: 'patient',
    },
    healthData: {
      weight: Number,
      height: Number,
      targetWeight: Number,
      birthDate: Date,
      gender: {
        type: String,
        enum: ['male', 'female'],
      },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      },
      dailyCalorieGoal: Number,
      allergies: [String],
      medicalConditions: [String],
    },
    deviceTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        platform: {
          type: String,
          enum: ['android', 'ios'],
          required: true,
        },
        deviceId: {
          type: String,
          required: true,
        },
        lastUsed: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notificationPreferences: {
      waterReminders: {
        type: Boolean,
        default: true,
      },
      mealReminders: {
        type: Boolean,
        default: true,
      },
      medicationReminders: {
        type: Boolean,
        default: true,
      },
      progressUpdates: {
        type: Boolean,
        default: true,
      },
      quietHoursStart: String,
      quietHoursEnd: String,
    },
    lastSync: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
