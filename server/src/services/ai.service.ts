import { env } from '../config/env';

export interface CategorySentiment {
  taste: 'positive' | 'neutral' | 'negative';
  service: 'positive' | 'neutral' | 'negative';
  ambience: 'positive' | 'neutral' | 'negative';
  value: 'positive' | 'neutral' | 'negative';
  cleanliness: 'positive' | 'neutral' | 'negative';
}

export interface AIAnalysis {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  categories: CategorySentiment;
  tags: string[];
}

const POSITIVE_WORDS = [
  'delicious', 'amazing', 'great', 'love', 'loved', 'excellent', 'best', 'yummy', 'tasty',
  'fresh', 'flavorful', 'perfect', 'fast', 'friendly', 'clean', 'amazing', 'wonderful',
  'good', 'awesome', 'spicy', 'juicy', 'crispy', 'quick', 'huge', 'generous', 'warm',
];
const NEGATIVE_WORDS = [
  'slow', 'bad', 'terrible', 'awful', 'cold', 'expensive', 'dirty', 'bland', 'disappointed',
  'worst', 'rude', 'overpriced', 'small', 'burnt', 'soggy', 'late', 'wait', 'waiting',
];

const TAG_MAP: { tag: string; keywords: string[] }[] = [
  { tag: 'Great food', keywords: ['delicious', 'tasty', 'yummy', 'flavorful', 'fresh', 'amazing', 'best', 'juicy', 'crispy'] },
  { tag: 'Fast service', keywords: ['fast', 'quick', 'prompt'] },
  { tag: 'Friendly staff', keywords: ['friendly', 'staff', 'polite', 'kind', 'welcoming'] },
  { tag: 'Good value', keywords: ['value', 'worth', 'cheap', 'affordable', 'reasonable', 'generous'] },
  { tag: 'Nice ambience', keywords: ['ambience', 'ambiance', 'nice', 'cozy', 'comfortable', 'atmosphere', 'vibe', 'decor'] },
  { tag: 'Slow service', keywords: ['slow', 'wait', 'waiting', 'late'] },
  { tag: 'Too expensive', keywords: ['expensive', 'overpriced', 'pricey', 'costly'] },
  { tag: 'Clean place', keywords: ['clean', 'hygienic', 'tidy', 'spotless'] },
  { tag: 'Spicy', keywords: ['spicy', 'hot'] },
];

function flattenText(text: string): string {
  return (text || '').toLowerCase();
}

function detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const flat = flattenText(text);
  if (!flat) return 'neutral';
  let score = 0;
  for (const w of POSITIVE_WORDS) {
    if (flat.includes(w)) score += 1;
  }
  for (const w of NEGATIVE_WORDS) {
    if (flat.includes(w)) score -= 1;
  }
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

function detectTags(text: string): string[] {
  const flat = flattenText(text);
  const found = TAG_MAP.filter(({ keywords }) => keywords.some((k) => flat.includes(k))).map(
    ({ tag }) => tag
  );
  return [...new Set(found)].slice(0, 5);
}

function defaultCategories(sentiment: 'positive' | 'neutral' | 'negative'): CategorySentiment {
  return {
    taste: sentiment,
    service: sentiment === 'negative' ? 'neutral' : sentiment,
    ambience: 'neutral',
    value: sentiment,
    cleanliness: 'neutral',
  };
}

function buildSummary(text: string, sentiment: 'positive' | 'neutral' | 'negative'): string {
  const flat = flattenText(text).trim();
  const excerpt = flat.slice(0, 120) || 'No text provided.';
  if (sentiment === 'positive') {
    return 'Customers report a positive experience, with strong praise for the taste and quality of food. Service and value are generally well received.';
  }
  if (sentiment === 'negative') {
    return 'Customer feedback skews negative, with concerns around waiting times and some disappointment with food or pricing.';
  }
  return 'Customer feedback is mixed but generally balanced, with a neutral overall impression and room for improvement in a few areas.';
}

export function analyzeReviewWithMock(input: {
  text?: string;
  voiceTranscript?: string;
  rating?: number;
  categoryRatings?: Record<string, number>;
}): AIAnalysis {
  const text = [input.text, input.voiceTranscript].filter(Boolean).join(' ');
  const sentiment = detectSentiment(text);
  const tags = detectTags(text);
  const categories: CategorySentiment = { ...defaultCategories(sentiment) };

  void buildSummary;

  const rating = input.rating ?? 0;
  if (rating >= 4 && sentiment === 'neutral') {
    categories.taste = 'positive';
  }
  if (input.categoryRatings) {
    const map = categories as unknown as Record<string, 'positive' | 'neutral' | 'negative'>;
    (Object.keys(input.categoryRatings) as (keyof CategorySentiment)[]).forEach((key) => {
      const v = input.categoryRatings?.[key];
      if (typeof v === 'number') {
        map[key] = v >= 4 ? 'positive' : v <= 2 ? 'negative' : 'neutral';
      }
    });
  }

  return {
    summary: buildSummary(text, sentiment),
    sentiment,
    categories,
    tags,
  };
}

export async function analyzeReview(input: {
  text?: string;
  voiceTranscript?: string;
  rating?: number;
  categoryRatings?: Record<string, number>;
}): Promise<AIAnalysis> {
  if (!env.ai.apiKey || !env.ai.baseUrl) {
    return analyzeReviewWithMock(input);
  }

  const text = [input.text, input.voiceTranscript].filter(Boolean).join(' ').slice(0, 600);
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
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'You analyze restaurant reviews. Return STRICT JSON only: {"summary":string,"sentiment":"positive"|"neutral"|"negative","categories":{"taste":...,"service":...,"ambience":...,"value":...,"cleanliness":...},"tags":string[]}. Categories values are "positive"|"neutral"|"negative".',
          },
          { role: 'user', content: `Review text: ${text}\nRating: ${input.rating ?? 'n/a'}` },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`AI API error ${res.status}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) throw new Error('AI API empty response');
    const parsed = JSON.parse(raw);
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : 'Summary unavailable.',
      sentiment: ['positive', 'neutral', 'negative'].includes(parsed.sentiment)
        ? parsed.sentiment
        : 'neutral',
      categories: {
        ...defaultCategories('neutral'),
        ...(parsed.categories ?? {}),
      },
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    };
  } catch (err) {
    console.warn('[ai] real provider failed, using mock fallback:', err);
    return analyzeReviewWithMock(input);
  }
}

export async function generateRestaurantSummary(reviews: {
  text: string;
  sentiment: string;
  rating: number;
}[]): Promise<string> {
  if (reviews.length === 0) {
    return 'No reviews yet. Be the first to share your experience!';
  }
  const flattened = reviews
    .map((r) => r.text || r.sentiment)
    .join(' ')
    .slice(0, 800);

  if (!env.ai.apiKey) {
    const positives = reviews.filter((r) => r.sentiment === 'positive').length;
    const negatives = reviews.filter((r) => r.sentiment === 'negative').length;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    if (avg >= 4) {
      return 'Customers consistently praise the food quality and portion sizes. Service is generally positive, while waiting times receive mixed feedback.';
    }
    if (avg >= 3) {
      return 'Overall feedback is decent, with good food highlights but some variability in service time and consistency.';
    }
    if (negatives > positives) {
      return 'Recent reviewers have been disappointed, mentioning issues with food quality and service speed.';
    }
    return 'Customer sentiment is mixed. Food is appreciated by some, while others note inconsistencies in service.';
  }

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
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'Write a concise 2-3 sentence AI review summary for a restaurant, based on aggregated customer review text. Return plain text only.',
          },
          { role: 'user', content: flattened },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`AI API error ${res.status}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const summary = data.choices?.[0]?.message?.content;
    if (typeof summary !== 'string' || !summary.trim()) throw new Error('Empty summary');
    return summary.trim();
  } catch (err) {
    console.warn('[ai] summary provider failed, using mock fallback:', err);
    const positives = reviews.filter((r) => r.sentiment === 'positive').length;
    return positives >= reviews.length / 2
      ? 'Customers consistently praise the food quality and portion sizes. Service is generally positive, while waiting times receive mixed feedback.'
      : 'Customer feedback is mixed with both positive and negative observations.';
  }
}