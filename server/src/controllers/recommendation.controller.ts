import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { buildRecommendations } from '../services/recommendation.service';
import { Restaurant } from '../models/Restaurant';

export const getRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const limit = Math.min(Number(req.query.limit) || 10, 20);

  const recommendations = await buildRecommendations(user, limit);

  const ids = recommendations.map((r) => r.restaurantId);
  const restaurants = ids.length
    ? await Restaurant.find({ _id: { $in: ids } }).lean()
    : [];

  const byId = new Map(restaurants.map((r) => [String(r._id), r]));

  const result = recommendations
    .map((rec) => {
      const restaurant = byId.get(rec.restaurantId);
      if (!restaurant) return null;
      if (restaurant.reviewCount > 0 && restaurant.rating <= 0) return null;
      return {
        ...rec,
        restaurant: {
          ...restaurant,
          matchPercentage: rec.matchPercentage,
          matchReasons: rec.reasons,
        },
      };
    })
    .filter(Boolean);

  return res.json({ recommendations: result });
});