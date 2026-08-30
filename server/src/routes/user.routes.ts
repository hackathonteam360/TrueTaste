import { Router } from 'express';
import {
  getMe,
  updateMe,
  updatePreferences,
  getFavorites,
  addFavorite,
  removeFavorite,
  subscribePremium,
  cancelSubscription,
} from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/preferences', updatePreferences);
router.get('/favorites', getFavorites);
router.post('/favorites/:restaurantId', addFavorite);
router.delete('/favorites/:restaurantId', removeFavorite);
router.post('/subscription', subscribePremium);
router.delete('/subscription', cancelSubscription);

export default router;