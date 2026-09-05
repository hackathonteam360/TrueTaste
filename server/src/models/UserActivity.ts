import mongoose, { Schema, model, Types } from 'mongoose';

export interface IUserActivity {
  userId: Types.ObjectId;
  type: 'search' | 'dish_view';
  food: string;
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['search', 'dish_view'], required: true },
    food: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

userActivitySchema.index({ userId: 1, createdAt: -1 });

export const UserActivity =
  mongoose.models.UserActivity || model<IUserActivity>('UserActivity', userActivitySchema);