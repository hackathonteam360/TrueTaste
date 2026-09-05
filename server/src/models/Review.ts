import mongoose, { Schema, model, Types } from 'mongoose';

export interface ICategoryRatings {
  taste?: number;
  service?: number;
  ambience?: number;
  value?: number;
  cleanliness?: number;
}

export interface IReview {
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  rating: number;
  text: string;
  voiceTranscript: string;
  categoryRatings: ICategoryRatings;
  sentiment: 'positive' | 'neutral' | 'negative';
  aiSummary: string;
  tags: string[];
  restaurantReply: string;
  images: string[];
  dishTags: string[];
  coinsAwarded: number;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: '' },
    voiceTranscript: { type: String, default: '' },
    categoryRatings: {
      taste: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      ambience: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
    },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    aiSummary: { type: String, default: '' },
    tags: { type: [String], default: [] },
    restaurantReply: { type: String, default: '' },
    images: { type: [String], default: [] },
    dishTags: { type: [String], default: [] },
    coinsAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ restaurantId: 1, createdAt: -1 });

export const Review = mongoose.models.Review || model<IReview>('Review', reviewSchema);