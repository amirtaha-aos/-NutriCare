import mongoose, { Document, Schema } from 'mongoose';

export interface ISyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'meal' | 'healthLog' | 'weight' | 'medication';
  data: any;
  timestamp: Date;
  status: 'pending' | 'synced' | 'conflict';
}

export interface ISyncQueue extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  operations: ISyncOperation[];
  createdAt: Date;
  processedAt?: Date;
}

const SyncQueueSchema = new Schema<ISyncQueue>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    operations: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['create', 'update', 'delete'],
          required: true,
        },
        entity: {
          type: String,
          enum: ['meal', 'healthLog', 'weight', 'medication'],
          required: true,
        },
        data: Schema.Types.Mixed,
        timestamp: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'synced', 'conflict'],
          default: 'pending',
        },
      },
    ],
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISyncQueue>('SyncQueue', SyncQueueSchema);
