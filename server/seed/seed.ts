import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User';
import { Restaurant } from '../src/models/Restaurant';
import { Review } from '../src/models/Review';
import { QRCode } from '../src/models/QRCode';
import { Reward } from '../src/models/Reward';
import { CoinTransaction } from '../src/models/CoinTransaction';
import { realRestaurants } from './restaurants.real';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truetaste';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/500`;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('[seed] connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    Review.deleteMany({}),
    QRCode.deleteMany({}),
    Reward.deleteMany({}),
    CoinTransaction.deleteMany({}),
  ]);

  // Users
  const passwordHash = await bcrypt.hash('demo123', 10);
  const demo = await User.create({
    name: 'Demo User',
    email: 'demo@truetaste.app',
    password: passwordHash,
    city: 'Lahore',
    cuisines: ['Pakistani', 'BBQ', 'Fast Food'],
    favoriteDishes: ['Biryani', 'Karahi', 'Burger', 'Fried Chicken'],
    spicePreference: 'Spicy',
    budgetPreference: '$$',
    dineCoins: 190,
    avatar: 'https://picsum.photos/seed/av-demo/200/200',
  });

  const reviewers = await Promise.all([
    User.create({
      name: 'Alina Khan',
      email: 'alina@example.com',
      password: passwordHash,
      city: 'Lahore',
      cuisines: ['Pakistani', 'Desserts'],
      favoriteDishes: ['Biryani'],
      spicePreference: 'Medium',
      budgetPreference: '$$',
      dineCoins: 130,
    }),
    User.create({
      name: 'Hamza Malik',
      email: 'hamza@example.com',
      password: passwordHash,
      city: 'Lahore',
      cuisines: ['BBQ', 'Fast Food'],
      favoriteDishes: ['Burger', 'Steak'],
      spicePreference: 'Very Spicy',
      budgetPreference: '$$$',
      dineCoins: 320,
    }),
    User.create({
      name: 'Sara Ahmed',
      email: 'sara@example.com',
      password: passwordHash,
      city: 'Islamabad',
      cuisines: ['Italian', 'Cafe', 'Korean'],
      favoriteDishes: ['Pizza', 'Pasta'],
      spicePreference: 'Mild',
      budgetPreference: '$$$',
      dineCoins: 95,
    }),
    User.create({
      name: 'Bilal Sheikh',
      email: 'bilal@example.com',
      password: passwordHash,
      city: 'Karachi',
      cuisines: ['Pakistani', 'Chinese'],
      favoriteDishes: ['Biryani'],
      spicePreference: 'Spicy',
      budgetPreference: '$',
      dineCoins: 180,
    }),
  ]);
  const reviewerIds = reviewers.map((r) => r._id.toString());

  // Restaurants + reviews
  const createdRestaurants = [];
  for (let i = 0; i < realRestaurants.length; i += 1) {
    const seedData = realRestaurants[i];
    const restaurant = await Restaurant.create({
      name: seedData.name,
      description: seedData.description,
      images: [img(`${seedData.name}-1`), img(`${seedData.name}-2`)],
      cuisine: seedData.cuisine,
      dishes: seedData.dishes,
      priceLevel: seedData.priceLevel,
      city: seedData.city,
      latitude: seedData.latitude,
      longitude: seedData.longitude,
      address: seedData.address,
      openingHours: seedData.openingHours,
      isOpen: seedData.isOpen,
    });
    createdRestaurants.push(restaurant);

    const reviews = seedData.reviews.map((rev, ri) => ({
      userId: reviewerIds[ri % reviewerIds.length],
      restaurantId: restaurant._id.toString(),
      rating: rev.rating,
      text: rev.text,
      voiceTranscript: '',
      categoryRatings: rev.categories,
      sentiment: rev.sentiment,
      aiSummary: '',
      tags: rev.tags,
      coinsAwarded: 10,
    }));

    const inserted = await Review.insertMany(reviews);
    await Review.updateMany(
      { _id: { $in: inserted.map((x) => x._id) } },
      [
        {
          $set: {
            aiSummary: {
              $switch: {
                branches: [
                  { case: { $gte: [{ $avg: '$rating' }, 4.5] }, then: 'Customers consistently praise the food quality and portion sizes. Service is generally positive, while waiting times receive mixed feedback.' },
                  { case: { $gte: [{ $avg: '$rating' }, 3.5] }, then: 'Customer feedback is generally positive, with strong highlights on taste and value.' },
                  { case: { $eq: ['$sentiment', 'negative'] }, then: 'Recent reviewers have been disappointed, mentioning issues with service speed and consistency.' },
                ],
                default: 'Customer feedback is decent overall, with a few areas for improvement.',
              },
            },
          },
        },
      ]
    );

    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    restaurant.rating = Math.round((sum / reviews.length) * 10) / 10;
    restaurant.reviewCount = reviews.length;
    await restaurant.save();
  }

  // QR codes for every restaurant (tables vary per restaurant index)
  const qrDocs: any[] = [];
  createdRestaurants.forEach((restaurant, idx) => {
    const tables = idx % 2 === 0 ? [3, 4, 7, 12] : [1, 2, 5, 9];
    tables.forEach((table) => {
      const code = `TT-${restaurant._id.toString()}-${table}`;
      qrDocs.push({
        restaurantId: restaurant._id,
        tableNumber: table,
        code,
        active: true,
      });
    });
  });
  await QRCode.insertMany(qrDocs);

  // Sample deep-link QR strings table (shown in the QR demo screen)
  const sampleQrRow = createdRestaurants
    .slice(0, 6)
    .map((r) => ({ restaurantId: r._id.toString(), table: 3, url: `truetaste://review/${r._id}/3` }));
  console.log('[seed] sample QR payloads:', JSON.stringify(sampleQrRow, null, 2));

  // Rewards
  await Reward.insertMany([
    {
      title: 'Free Delivery',
      description: 'One free delivery on your next order',
      type: 'delivery',
      coinCost: 100,
      value: 1,
      image: 'https://picsum.photos/seed/reward-delivery/400/300',
      active: true,
    },
    {
      title: '$5 Restaurant Coupon',
      description: '$5 off your next dine-in bill at partner restaurants',
      type: 'coupon',
      coinCost: 50,
      value: 5,
      image: 'https://picsum.photos/seed/reward-coupon/400/300',
      active: true,
    },
    {
      title: '20% Off',
      description: '20% off your total bill at partner restaurants',
      type: 'discount',
      coinCost: 150,
      value: 20,
      image: 'https://picsum.photos/seed/reward-off/400/300',
      active: true,
    },
    {
      title: 'Free Dessert',
      description: 'A complimentary dessert at participating cafés',
      type: 'coupon',
      coinCost: 60,
      value: 1,
      image: 'https://picsum.photos/seed/reward-dessert/400/300',
      active: true,
    },
  ]);

  // Coin transactions for demo user
  const freeDelivery = await Reward.findOne({ title: 'Free Delivery' });
  const demoTxs = [
    {
      userId: demo._id,
      type: 'earn',
      amount: 10,
      description: "Review for Salt'n Pepper",
    },
    {
      userId: demo._id,
      type: 'earn',
      amount: 10,
      description: 'Review for Bundu Khan',
    },
    {
      userId: demo._id,
      type: 'bonus',
      amount: 50,
      description: 'Welcome bonus',
    },
    {
      userId: demo._id,
      type: 'redeem',
      amount: -(freeDelivery?.coinCost ?? 100),
      description: 'Free Delivery promo',
    },
  ];
  await CoinTransaction.insertMany(demoTxs);
  // Pre-history balance so the Activity feed always adds up to dineCoins.
  const baseBalance = 190;
  demo.dineCoins = baseBalance + demoTxs.reduce((sum, tx) => sum + tx.amount, 0);
  await demo.save();

  console.log('[seed] done.');
  console.log('[seed] Demo login:  demo@truetaste.app  /  demo123');
  await mongoose.disconnect();
}

seed()
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  });

export default {};