import { Router } from 'express';
import { resolveCode } from '../controllers/qr.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/:code', requireAuth, resolveCode);

export default router;