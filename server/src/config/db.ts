import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri);
    console.log(`[db] connected to MongoDB`);
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err);
    throw err;
  }
}