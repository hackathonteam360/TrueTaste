import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import reviewRoutes from './routes/review.routes';
import recommendationRoutes from './routes/recommendation.routes';
import rewardRoutes from './routes/reward.routes';
import userRoutes from './routes/user.routes';
import qrRoutes from './routes/qr.routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

const allowedOrigins = env.clientOrigin
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    },
  })
);
app.use(express.json({ limit: '2mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api', limiter);

const health = (req: express.Request, res: express.Response) => {
  res.json({ ok: true, service: 'truetaste-api' });
};
app.get('/', health);
app.get('/api/health', health);

// Cleaning: if the mobile client passes a stale token, the middleware responds 401.
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qr', qrRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;