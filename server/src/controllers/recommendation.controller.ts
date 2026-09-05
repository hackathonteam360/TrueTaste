import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { buildRecommendations } from '../services/recommendation.service';
import { Restaurant } from '../models/Restaurant';
import { env } from '../config/env';

async function generateWhys(restaurants: { id: string; name: string }[], user: any): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!env.ai.apiKey || !env.ai.baseUrl || restaurants.length === 0) return map;

  const taste = [
    `cuisines: ${(user.cuisines || []).join(', ') || 'none set'}`,
    `favorite dishes: ${(user.favoriteDishes || []).join(', ') || 'none set'}`,
    `spice: ${user.spicePreference ?? 'Medium'}`,
    `budget: ${user.budgetPreference ?? '$$'}`,
    `city: ${user.city ?? 'Lahore'}`,
  ].join(' · ');

  const prompt = [
    `User's taste: ${taste}`,
    `Candidate restaurants:\n${restaurants.map((r) => `- ${r.name}`).join('\n')}`,
    'For each candidate, write ONE short personal-sounding reason a food lover with this taste would enjoy it, mentioning dishes where relevant. Do not repeat dishes they have not ordered. Return STRICT JSON only: an object mapping restaurant name to reason string.',
  ].join('\n\n');

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${env.ai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: env.ai.model,
        temperature: 0.6,
        messages: [
          { role: 'system', content: 'You give personalized restaurant recommendation reasons. Return STRICT JSON only.' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`AI API error ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty AI response');
    const parsed = JSON.parse(raw);
    restaurants.forEach((r) => {
      const why = parsed[r.name] ?? parsed[String(r.id)];
      if (typeof why === 'string' && why.trim()) map.set(r.id, why.trim());
    });
  } catch (err) {
    console.warn('[ai] whys generator failed:', err);
  }
  return map;
}

export const getRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const limit = Math.min(Number(req.query.limit) || 10, 20);

  const recommendations = await buildRecommendations(user, limit);

  const ids = recommendations.map((r) => r.restaurantId);
  const restaurants = ids.length
    ? await Restaurant.find({ _id: { $in: ids } }).lean()
    : [];

  const byId = new Map(restaurants.map((r) => [String(r._id), r]));

  const whys = await generateWhys(
    restaurants.map((r) => ({ id: String(r._id), name: r.name })),
    user
  );

  const result = recommendations
    .map((rec) => {
      const restaurant = byId.get(rec.restaurantId);
      if (!restaurant) return null;
      if (restaurant.reviewCount > 0 && restaurant.rating <= 0) return null;
      return {
        ...rec,
        aiWhy: whys.get(rec.restaurantId),
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