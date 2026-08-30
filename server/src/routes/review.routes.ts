import { Router } from 'express';
import multer from 'multer';
import {
  createReview,
  uploadVoiceReview,
  myReviews,
  getRestaurantSummary,
  getAnalytics,
} from '../controllers/review.controller';
import { requireAuth } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.use(requireAuth);

router.post('/', createReview);
router.post('/voice', upload.single('audio'), uploadVoiceReview);
router.get('/my', myReviews);
router.get('/restaurant/:restaurantId/summary', getRestaurantSummary);
router.get('/restaurant/:restaurantId/analytics', getAnalytics);

export default router;