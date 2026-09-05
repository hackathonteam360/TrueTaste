import { Response } from 'express';
import { z } from 'zod';
import { Review } from '../models/Review';
import { Restaurant } from '../models/Restaurant';
import { UserActivity } from '../models/UserActivity';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const eventSchema = z.object({
  type: z.enum(['search', 'dish_view']),
  food: z.string().min(1).max(120),
});

export const trackEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type, food } = eventSchema.parse(req.body);
  const normalized = food.trim().toLowerCase();
  if (!normalized) return res.status(400).json({ message: 'food is required' });

  await UserActivity.create({ userId: req.user._id, type, food: normalized });
  return res.status(201).json({ ok: true });
});

function norm(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ').replace(/s$/, '').trim();
}

export const getFoodStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [searches, views, reviews] = await Promise.all([
    UserActivity.find({ userId: req.user._id, type: 'search' })
      .select('food')
      .limit(500)
      .lean(),
    UserActivity.find({ userId: req.user._id, type: 'dish_view' })
      .select('food')
      .limit(500)
      .lean(),
    Review.find({ userId: req.user._id }).select('text voiceTranscript restaurantId').lean(),
  ]);

  const counts = new Map<string, { food: string; count: number; sources: Set<string> }>();

  const bump = (food: string, source: string) => {
    const key = norm(food);
    if (!key) return;
    const entry = counts.get(key) ?? { food: key, count: 0, sources: new Set<string>() };
    entry.count += 1;
    entry.sources.add(source);
    counts.set(key, entry);
  };

  searches.forEach((s) => bump(s.food, 'search'));
  views.forEach((v) => bump(v.food, 'dish_view'));

  if (reviews.length > 0) {
    const restaurantIds = [...new Set(reviews.map((r) => String(r.restaurantId)))];
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } })
      .select('dishes')
      .lean();
    const dishNamesByRestaurant = new Map(
      restaurants.map((r) => [
        String(r._id),
        (r.dishes ?? []).map((d: any) => String(d.name)),
      ])
    );
    reviews.forEach((r) => {
      const dishNames: string[] = dishNamesByRestaurant.get(String(r.restaurantId)) ?? [];
      const flat = `${r.text} ${r.voiceTranscript}`.toLowerCase();
      dishNames.forEach((name) => {
        if (name && flat.includes(name.toLowerCase())) bump(name, 'reviewed');
      });
    });
  }

  const items = [...counts.values()]
    .map(({ food, count, sources }) => ({
      food,
      count,
      sources: [...sources].sort(),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const total = items.reduce((s, i) => s + i.count, 0);

  return res.json({ total, items });
});