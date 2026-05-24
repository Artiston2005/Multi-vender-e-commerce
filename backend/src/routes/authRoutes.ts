import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { authenticate, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Example protected route showing RBAC
router.get('/me', authenticate, (req, res) => {
  res.json({ user: (req as AuthRequest).user });
});

export default router;
