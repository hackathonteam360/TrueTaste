import { Router } from 'express';
import { trackEvent, getFoodStats } from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/events', trackEvent);
router.get('/food-stats', getFoodStats);

export default router;