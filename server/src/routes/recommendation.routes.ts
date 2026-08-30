import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendation.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getRecommendations);

export default router;