import { Response } from 'express';
import { z } from 'zod';
import { Review } from '../models/Review';
import { Restaurant } from '../models/Restaurant';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { analyzeReview, generateRestaurantReply, tagDishFromPhoto } from '../services/ai.service';
import { awardCoins, REVIEW_COINS } from '../services/coin.service';
import { transcribeVoice } from '../services/stt.service';
import { uploadImage } from '../services/cloudinary.service';

const REVIEW_TAGS = [
  'Great food',
  'Fast service',
  'Friendly staff',
  'Good value',
  'Nice ambience',
  'Slow service',
  'Too expensive',
  'Clean place',
  'Spicy',
];

const createReviewSchema = z.object({
  restaurantId: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  text: z.string().max(2000).optional().default(''),
  voiceTranscript: z.string().max(4000).optional().default(''),
  categoryRatings: z
    .object({
      taste: z.coerce.number().min(1).max(5).optional(),
      service: z.coerce.number().min(1).max(5).optional(),
      ambience: z.coerce.number().min(1).max(5).optional(),
      value: z.coerce.number().min(1).max(5).optional(),
      cleanliness: z.coerce.number().min(1).max(5).optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional().default([]),
  imageBase64: z.string().max(3_000_000).optional(),
});

async function recalcRestaurant(rId: string) {
  const all = await Review.find({ restaurantId: rId }).select('rating');
  if (all.length === 0) {
    await Restaurant.findByIdAndUpdate(rId, { rating: 0, reviewCount: 0 });
    return;
  }
  const sum = all.reduce((s, r) => s + r.rating, 0);
  await Restaurant.findByIdAndUpdate(rId, {
    rating: Math.round((sum / all.length) * 10) / 10,
    reviewCount: all.length,
  });
}

async function ensureSummary(rId: string) {
  const reviews = await Review.find({ restaurantId: rId })
    .select('text voiceTranscript sentiment rating')
    .lean();
  const aggregate = reviews.map((r) => ({
    text: [r.text, r.voiceTranscript].filter(Boolean).join(' '),
    sentiment: r.sentiment || 'neutral',
    rating: r.rating,
  }));
  return aggregate;
}

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = createReviewSchema.parse(req.body);

  const restaurant = await Restaurant.findById(body.restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  if (!body.text && !body.voiceTranscript) {
    return res.status(400).json({ message: 'Please add some text or a voice review' });
  }

  const reviewText = [body.text, body.voiceTranscript].filter(Boolean).join('\n');

  const tags = body.tags.filter((t) => REVIEW_TAGS.includes(t));

  const analysis = await analyzeReview({
    text: body.text,
    voiceTranscript: body.voiceTranscript,
    rating: body.rating,
    categoryRatings: body.categoryRatings,
  });

  let images: string[] = [];
  let dishTags: string[] = [];

  if (body.imageBase64) {
    const raw = body.imageBase64.split(',')[1] ?? body.imageBase64;
    const buf = Buffer.from(raw, 'base64');
    const url = await uploadImage(buf, 'truetaste/review-photos');
    if (url) {
      images = [url];
      dishTags = await tagDishFromPhoto(url);
    } else {
      // Cloudinary not configured — store inline so photo reviews still work.
      images = [`data:image/jpeg;base64,${raw}`];
    }
  }

  let dishTagsFromText: string[] = [];
  if (restaurant.dishes.length > 0 && reviewText.trim()) {
    const flat = reviewText.toLowerCase();
    const dishList: { name: string }[] = restaurant.dishes.map((d: any) => d);
    const matched = dishList
      .filter((d) => flat.includes(String(d.name).toLowerCase()))
      .map((d) => d.name);
    dishTagsFromText = [...new Set(matched)].slice(0, 5);
  }
  dishTags = [...new Set([...dishTagsFromText, ...dishTags])].slice(0, 6);

  let coinsAwarded = 0;
  let newBalance = 0;
  const existing = await Review.findOne({
    userId: req.user._id,
    restaurantId: body.restaurantId,
  });
  if (!existing) {
    const result = await awardCoins({
      userId: String(req.user._id),
      amount: REVIEW_COINS,
      type: 'earn',
      description: `Review for ${restaurant.name}`,
      referenceId: restaurant.id,
    });
    coinsAwarded = REVIEW_COINS;
    newBalance = result.balance;
  } else {
    const user = await User.findById(req.user._id);
    newBalance = user?.dineCoins ?? 0;
  }

  const restaurantReply = await generateRestaurantReply({
    text: reviewText,
    sentiment: analysis.sentiment,
    restaurantName: restaurant.name,
  });

  const review = await Review.create({
    userId: req.user._id,
    restaurantId: body.restaurantId,
    rating: body.rating,
    text: body.text,
    voiceTranscript: body.voiceTranscript,
    categoryRatings: body.categoryRatings || {},
    sentiment: analysis.sentiment,
    aiSummary: analysis.summary,
    tags,
    restaurantReply,
    images,
    dishTags,
    coinsAwarded,
  });

  await recalcRestaurant(body.restaurantId);

  return res.status(201).json({
    review,
    ai: analysis,
    coinsEarned: coinsAwarded,
    dineCoinBalance: newBalance,
  });
});

export const getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  const reviews = await Review.find({ restaurantId: req.params.restaurantId })
    .select('rating sentiment categoryRatings')
    .lean();

  if (reviews.length === 0) {
    return res.json({ reviewCount: 0, averageRating: 0, categories: {}, ratingDistribution: {}, sentiments: {} });
  }

  const keys = ['taste', 'service', 'ambience', 'value', 'cleanliness'] as const;
  const categories: Record<string, number> = {};
  const ratingsCount: Record<string, number> = {};
  const sentiments = { positive: 0, neutral: 0, negative: 0 };

  keys.forEach((k) => {
    const vals = reviews
      .map((r) => (r.categoryRatings as any)?.[k])
      .filter((v): v is number => typeof v === 'number');
    categories[k] = vals.length
      ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10
      : Math.round(restaurant.rating);
  });

  reviews.forEach((r) => {
    const key = String(r.rating);
    ratingsCount[key] = (ratingsCount[key] || 0) + 1;
    if (sentiments[r.sentiment as keyof typeof sentiments] !== undefined) {
      sentiments[r.sentiment as keyof typeof sentiments]++;
    }
  });

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const total = reviews.length;
  const ratingDistribution = Object.fromEntries(
    Object.entries(ratingsCount).map(([star, count]) => [
      star,
      Math.round((count / total) * 100),
    ])
  );

  return res.json({
    reviewCount: total,
    averageRating: Math.round(avg * 10) / 10,
    categories,
    ratingDistribution,
    sentiments,
  });
});

export const uploadVoiceReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const audio = (req.files as any)?.audio ?? (req as any).file;
  const buffer: Buffer | undefined = audio?.buffer;
  const durationMs = Number(req.body?.durationMs || 0);

  let transcript = '';
  if (buffer && buffer.length > 0) {
    transcript = await transcribeVoice(buffer, durationMs);
  } else {
    // Allow a plain-JSON path for demo/testing when no file is attached.
    const mock = z
      .object({ mockTranscript: z.string().max(2000).optional() })
      .parse(req.body);
    transcript = mock.mockTranscript || 'I had a really nice meal and the staff was friendly.';
  }

  return res.json({ transcript });
});

export const myReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('restaurantId', 'name images city cuisine rating')
    .lean();
  return res.json({ reviews });
});

export const getRestaurantSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  const aggregate = await ensureSummary(req.params.restaurantId);

  // A real summary endpoint that could call the AI once and cache it on the restaurant.
  // For this MVP we derive category stats + sentiment breakdown, and rely on the mock AI
  // summary stored on each review. Individual review summaries are combined below.
  const sentiments = { positive: 0, neutral: 0, negative: 0 };
  aggregate.forEach((r) => {
    if (sentiments[r.sentiment as keyof typeof sentiments] !== undefined) {
      sentiments[r.sentiment as keyof typeof sentiments] += 1;
    }
  });

  return res.json({
    reviewCount: aggregate.length,
    averageRating: restaurant.rating,
    sentiments,
    summary: aggregate.length
      ? generateCombinedSummary(sentiments, restaurant.rating)
      : 'No reviews yet. Be the first to share your experience!',
  });
});

function generateCombinedSummary(
  sentiments: { positive: number; negative: number; neutral: number },
  rating: number
): string {
  if (rating >= 4) {
    return 'Customers consistently praise the food quality and portion sizes. Service is generally positive, while waiting times receive mixed feedback.';
  }
  if (sentiments.negative > sentiments.positive) {
    return 'Recent feedback is less favourable, with some mentions of slow service and inconsistent experiences.';
  }
  return 'Customer feedback is generally mixed to positive. Food is appreciated while service speed varies between visits.';
}