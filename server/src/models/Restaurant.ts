import mongoose, { Schema, model } from 'mongoose';

export interface IDish {
  name: string;
  price: number;
  description: string;
}

export interface IRestaurant {
  name: string;
  description: string;
  images: string[];
  cuisine: string[];
  dishes: IDish[];
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3 | 4;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  isOpen: boolean;
  createdAt: Date;
}

const dishSchema = new Schema<IDish>({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
});

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    cuisine: { type: [String], default: [] },
    dishes: { type: [dishSchema], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    priceLevel: { type: Number, enum: [1, 2, 3, 4], default: 2 },
    address: { type: String, default: '' },
    city: { type: String, default: 'Lahore', index: true },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    openingHours: { type: String, default: '12:00 PM - 12:00 AM' },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', 'cuisine': 'text' });
restaurantSchema.index({ 'dishes.name': 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ city: 1, rating: -1 });

export const Restaurant = mongoose.models.Restaurant || model<IRestaurant>('Restaurant', restaurantSchema);