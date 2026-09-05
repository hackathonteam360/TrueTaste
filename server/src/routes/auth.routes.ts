import { Router } from 'express';
import { register, login, me, googleLogin } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', requireAuth, me);

export default router;