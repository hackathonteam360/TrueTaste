import { Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { Review } from '../models/Review';
import { Subscription } from '../models/Subscription';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { awardCoins } from '../services/coin.service';

const CUISINES = ['Pakistani', 'Italian', 'Chinese', 'BBQ', 'Fast Food', 'Korean', 'Mexican', 'Desserts', 'Cafe'];
const DISHES = ['Biryani', 'Karahi', 'Burger', 'Pizza', 'Pasta', 'Steak', 'Fried Chicken'];
const SPICE = ['Mild', 'Medium', 'Spicy', 'Very Spicy'];
const BUDGET = ['$', '$$', '$$$', '$$$$'];

const updateMeSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  city: z.string().max(80).optional(),
});

const preferencesSchema = z.object({
  cuisines: z.array(z.enum(CUISINES as any)).max(9).optional(),
  favoriteDishes: z.array(z.enum(DISHES as any)).max(12).optional(),
  spicePreference: z.enum(SPICE as any).optional(),
  budgetPreference: z.enum(BUDGET as any).optional(),
  city: z.string().max(80).optional(),
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id)
    .populate('favoriteRestaurants', 'name images city cuisine rating priceLevel')
    .lean();
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const [reviewCount, restaurantsCount, transactions] = await Promise.all([
    Review.countDocuments({ userId: req.user._id }),
    Review.distinct('restaurantId', { userId: req.user._id }),
    Subscription.findOne({ userId: req.user._id, status: 'active' }).lean(),
  ]);

  const giftCards = user as any;
  return res.json({
    user: { ...giftCards, reviewCount, restaurantsVisited: restaurantsCount.length, subscription: transactions },
  });
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = updateMeSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.user._id, body, { new: true });
  return res.json({ user });
});

export const updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = preferencesSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.user._id, body, { new: true });
  return res.json({ user });
});

export const getFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = (await User.findById(req.user._id)
    .populate('favoriteRestaurants')
    .lean()) as any;
  return res.json({ favorites: user?.favoriteRestaurants ?? [] });
});

export const addFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favoriteRestaurants: req.params.restaurantId } },
    { new: true }
  ).populate('favoriteRestaurants');
  return res.json({ favorites: user?.favoriteRestaurants ?? [] });
});

export const removeFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favoriteRestaurants: req.params.restaurantId } },
    { new: true }
  ).populate('favoriteRestaurants');
  return res.json({ favorites: user?.favoriteRestaurants ?? [] });
});

export const subscribePremium = asyncHandler(async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const previouslySubscribed = await Subscription.exists({ userId: req.user._id });

  const subscription = await Subscription.findOneAndUpdate(
    { userId: req.user._id },
    {
      plan: 'premium',
      status: 'active',
      startDate: now,
      endDate: end,
    },
    { upsert: true, new: true }
  );

  await User.findByIdAndUpdate(req.user._id, { subscriptionStatus: 'premium' });

  // Mock: first time premium subscribers get a one-time bonus of 50 DineCoins.
  let balance = (await User.findById(req.user._id))?.dineCoins ?? 0;
  let bonusCoins = 0;
  if (!previouslySubscribed) {
    const result = await awardCoins({
      userId: String(req.user._id),
      amount: 50,
      type: 'bonus',
      description: 'Premium welcome bonus',
    });
    balance = result.balance;
    bonusCoins = 50;
  }

  return res.json({ subscription, bonusCoins, balance });
});

export const cancelSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Subscription.findOneAndUpdate(
    { userId: req.user._id },
    { status: 'cancelled' }
  );
  await User.findByIdAndUpdate(req.user._id, { subscriptionStatus: 'none' });
  return res.json({ message: 'Subscription cancelled' });
});