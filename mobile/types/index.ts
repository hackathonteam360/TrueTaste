export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  city: string;
  cuisines: string[];
  favoriteDishes: string[];
  spicePreference: 'Mild' | 'Medium' | 'Spicy' | 'Very Spicy';
  budgetPreference: '$' | '$$' | '$$$' | '$$$$';
  dineCoins: number;
  subscriptionStatus: 'none' | 'premium';
  favoriteRestaurants?: string[];
  reviewCount?: number;
  restaurantsVisited?: number;
  subscription?: Subscription | null;
  createdAt: string;
}

export interface Dish {
  name: string;
  price: number;
  description: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  images: string[];
  cuisine: string[];
  dishes: Dish[];
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3 | 4;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  isOpen: boolean;
  createdAt: string;
  matchedDishes?: string[];
  matchPercentage?: number;
  matchReasons?: string[];
  distanceKm?: number;
}

export interface CategoryRatings {
  taste?: number;
  service?: number;
  ambience?: number;
  value?: number;
  cleanliness?: number;
}

export interface Review {
  _id: string;
  userId: string | User;
  restaurantId: string | Restaurant;
  rating: number;
  text: string;
  voiceTranscript: string;
  categoryRatings: CategoryRatings;
  sentiment: 'positive' | 'neutral' | 'negative';
  aiSummary: string;
  tags: string[];
  coinsAwarded: number;
  images?: string[];
  dishTags?: string[];
  restaurantReply?: string;
  createdAt: string;
}

export interface Reward {
  _id: string;
  title: string;
  description: string;
  type: 'delivery' | 'coupon' | 'discount';
  coinCost: number;
  value: number;
  image: string;
  active: boolean;
}

export interface CoinTransaction {
  _id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'bonus';
  amount: number;
  description: string;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
}

export interface Recommendation {
  restaurantId: string;
  matchPercentage: number;
  reasons: string[];
  aiWhy?: string;
  restaurant: Restaurant;
}

export interface QrResult {
  restaurant: Restaurant;
  tableNumber: number;
  code: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface Paginated<T> {
  restaurants: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AIAnalysis {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  categories: {
    taste: string;
    service: string;
    ambience: string;
    value: string;
    cleanliness: string;
  };
  tags: string[];
}

export interface RestaurantAnalytics {
  reviewCount: number;
  averageRating: number;
  categories: Record<string, number>;
  ratingDistribution: Record<string, number>;
  sentiments: Record<string, number>;
}

export interface FoodStat {
  food: string;
  count: number;
  sources: string[];
}

export interface FoodStats {
  total: number;
  items: FoodStat[];
}