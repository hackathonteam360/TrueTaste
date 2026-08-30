import { Response } from 'express';
import { z } from 'zod';
import { Restaurant } from '../models/Restaurant';
import { Review } from '../models/Review';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const listQuerySchema = z.object({
  city: z.string().optional(),
  cuisine: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  price: z.coerce.number().min(1).max(4).optional(),
  openNow: z.enum(['true', 'false']).optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const listRestaurants = asyncHandler(async (req, res: Response) => {
  const q = listQuerySchema.parse(req.query);
  const filter: any = {};

  if (q.city) filter.city = q.city;
  if (q.cuisine) filter.cuisine = { $in: [q.cuisine] };
  if (q.rating) filter.rating = { $gte: q.rating };
  if (q.price) filter.priceLevel = q.price;
  if (q.openNow === 'true') filter.isOpen = true;

  if (q.q && q.q.trim()) {
    const re = new RegExp(escapeRegex(q.q.trim()), 'i');
    filter.$or = [
      { name: re },
      { cuisine: re },
      { 'dishes.name': re },
      { description: re },
    ];
  }

  const skip = (q.page - 1) * q.limit;
  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter).skip(skip).limit(q.limit).sort({ rating: -1 }).lean(),
    Restaurant.countDocuments(filter),
  ]);

  return res.json({ restaurants, total, page: q.page, limit: q.limit });
});

export const searchRestaurants = asyncHandler(async (req, res: Response) => {
  const q = (req.query.q as string) || '';
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  if (!q.trim()) {
    return res.json({ restaurants: [] });
  }

  const re = new RegExp(escapeRegex(q.trim()), 'i');
  const restaurants = await Restaurant.find({
    $or: [{ name: re }, { cuisine: re }, { 'dishes.name': re }],
  })
    .sort({ rating: -1 })
    .limit(limit)
    .lean();

  const matches = restaurants.map((r: any) => {
    const dishMatches = (r.dishes || [])
      .filter((d: any) => re.test(d.name))
      .map((d: any) => d.name);
    return { ...r, matchedDishes: dishMatches };
  });

  return res.json({ restaurants: matches });
});

export const getRestaurant = asyncHandler(async (req, res: Response) => {
  const restaurant = (await Restaurant.findById(req.params.id).lean()) as any;
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  const reviews = await (Review.find({ restaurantId: restaurant._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('userId', 'name avatar')
    .lean() as any);

  return res.json({ restaurant, reviews });
});

export const getRestaurantReviews = asyncHandler(async (req, res: Response) => {
  const reviews = await Review.find({ restaurantId: req.params.id })
    .sort({ createdAt: -1 })
    .populate('userId', 'name avatar')
    .lean();
  return res.json({ reviews });
});

export const getDishSearch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dish = (req.query.dish as string) || '';
  if (!dish.trim()) {
    return res.json({ restaurants: [] });
  }
  const re = new RegExp(escapeRegex(dish.trim()), 'i');
  const restaurants = await Restaurant.find({ 'dishes.name': re })
    .sort({ rating: -1 })
    .limit(20)
    .lean();
  const out = restaurants.map((r: any) => ({
    ...r,
    matchedDishes: ((r.dishes || []) as any[])
      .filter((d: any) => re.test(d.name))
      .map((d: any) => d.name),
  }));
  return res.json({ restaurants: out });
});