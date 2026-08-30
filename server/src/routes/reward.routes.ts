import { Router } from 'express';
import {
  listRewards,
  redeemReward,
  listTransactions,
} from '../controllers/reward.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', listRewards);
router.get('/transactions', listTransactions);
router.post('/:id/redeem', redeemReward);

export default router;