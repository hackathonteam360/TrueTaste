import mongoose, { Schema, model, Types } from 'mongoose';

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar: string;
  city: string;
  cuisines: string[];
  favoriteDishes: string[];
  spicePreference: 'Mild' | 'Medium' | 'Spicy' | 'Very Spicy';
  budgetPreference: '$' | '$$' | '$$$' | '$$$$';
  dineCoins: number;
  subscriptionStatus: 'none' | 'premium';
  favoriteRestaurants: Types.ObjectId[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, select: false, default: '' },
    googleId: { type: String, default: '', index: { unique: true, sparse: true } },
    avatar: { type: String, default: '' },
    city: { type: String, default: 'Lahore' },
    cuisines: { type: [String], default: [] },
    favoriteDishes: { type: [String], default: [] },
    spicePreference: {
      type: String,
      enum: ['Mild', 'Medium', 'Spicy', 'Very Spicy'],
      default: 'Medium',
    },
    budgetPreference: { type: String, enum: ['$', '$$', '$$$', '$$$$'], default: '$$' },
    dineCoins: { type: Number, default: 100 },
    subscriptionStatus: { type: String, enum: ['none', 'premium'], default: 'none' },
    favoriteRestaurants: [{ type: Schema.Types.ObjectId, ref: 'Restaurant' }],
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.models.User || model<IUser>('User', userSchema);