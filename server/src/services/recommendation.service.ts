import { Restaurant } from '../models/Restaurant';
import { Review } from '../models/Review';
import { env } from '../config/env';
import type { IUser } from '../models/User';

export interface Recommendation {
  restaurantId: string;
  matchPercentage: number;
  reasons: string[];
  aiWhy?: string;
}

interface Scored {
  restaurant: any;
  score: number;
  reasons: string[];
}

export async function buildRecommendations(user: IUser, limit = 10): Promise<Recommendation[]> {
  const city = user.city || 'Lahore';

  const [restaurants, myReviews] = await Promise.all([
    Restaurant.find({ city }).lean(),
    Review.find({ userId: user._id }).select('restaurantId rating text voiceTranscript').lean(),
  ]);

  if (restaurants.length === 0) {
    return []
  }

  const myRatings = new Map<string, number>();
  const reviewTexts: string[] = [];
  myReviews.forEach((r) => {
    const key = String(r.restaurantId);
    const existing = myRatings.get(key);
    if (existing === undefined || r.rating > existing) myRatings.set(key, r.rating);
    const joined = [r.text, r.voiceTranscript].filter(Boolean).join(' ');
    if (joined.trim()) reviewTexts.push(joined.toLowerCase());
  });
  const reviewDishSignals = new Set<string>();
  reviewTexts.forEach((text) => {
    // Credit any candidate dish mentioned in the user's review history.
    restaurants.forEach((r) => {
      (r.dishes || []).forEach((d: { name?: string }) => {
        if (d.name && text.includes(d.name.toLowerCase())) reviewDishSignals.add(d.name);
      });
    });
  });

  const userCuisines = new Set((user.cuisines || []).map((c) => c.toLowerCase()));
  const userDishes = new Set((user.favoriteDishes || []).map((d) => d.toLowerCase()));
  const spice = user.spicePreference || 'Medium';
  const budgetTarget = (user.budgetPreference || '$$').length;

  const results: Scored[] = restaurants
    .map((restaurant) => {
      let score = 0;
      const reasons: string[] = [];

      const cuisines = (restaurant.cuisine || []).map((c: string) => c.toLowerCase());
      const overlap = cuisines.filter((c: string) => userCuisines.has(c)).length;
      if (overlap > 0) {
        score += 40;
        if (overlap === 1) {
          reasons.push(`You like ${restaurant.cuisine[0]} food`);
        } else {
          reasons.push(`You like ${overlap} of these cuisines`);
        }
      } else {
        score += 10;
        reasons.push('New cuisine to explore');
      }

      const dishNames = ((restaurant.dishes || []) as { name: string }[]).map((d) =>
        String(d.name || '').toLowerCase()
      );
      const dishOverlap = dishNames.filter((d) => userDishes.has(d)).length;
      if (dishOverlap > 0) {
        score += 20;
        const favorite = (restaurant.dishes as { name: string }[]).find((d) =>
          userDishes.has(String(d.name).toLowerCase())
        );
        reasons.push(`They serve ${favorite?.name || 'one of your favorite dishes'}`);
      }

      const reviewedHere = (restaurant.dishes as { name: string }[])
        .map((d) => String(d.name))
        .filter((name) => reviewDishSignals.has(name));
      if (reviewedHere.length > 0) {
        score += 15;
        reasons.push(`You've raved about ${reviewedHere[0]} before`);
      }

      const spiceWords: Record<string, string[]> = {
        mild: ['mild', 'butter', 'creamy'],
        medium: ['medium'],
        spicy: ['spicy', 'karahi', 'biryani'],
        'very spicy': ['spicy', 'karahi', 'hot'],
      };
      const hot = (restaurant.name + ' ' + cuisines.join(' ')).toLowerCase();
      const spiceKey = spice.toLowerCase();
      if (spiceWords[spiceKey]?.some((w) => hot.includes(w))) {
        score += 5;
        reasons.push(`Great for ${spice} spice lovers`);
      }

      const priceDiff = Math.abs((restaurant.priceLevel || 2) - budgetTarget);
      score -= priceDiff * 3;

      const priorRating = myRatings.get(String(restaurant._id));
      if (priorRating !== undefined) {
        score += priorRating >= 4 ? 15 : -10;
        if (priorRating >= 4) reasons.push('You rated this place highly before');
      } else if (restaurant.reviewCount > 0) {
        score += (restaurant.rating || 0) - 3;
      }

      score += (restaurant.rating || 0) >= 4.4 ? 5 : 0;
      if (score < 0) score = 0;

      return { restaurant, score: Math.round(score), reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const sortedRestaurants = results.sort((a, b) => b.score - a.score);
  const unique = new Map<string, Scored>();
  sortedRestaurants.forEach((r) => unique.set(String(r.restaurant._id), r));

  return [...unique.values()].slice(0, limit).map(({ restaurant, score, reasons }) => ({
    restaurantId: String(restaurant._id),
    matchPercentage: Math.min(98, Math.max(55, Math.round(55 + (score / 90) * 43))),
    reasons: reasons.slice(0, 3),
  }));
}