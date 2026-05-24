import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { checkout, getMyOrders, createReview } from '../controllers/customerController';

const router = Router();

// Apply authentication to all customer routes
router.use(authenticate);

// Order and checkout routes
router.post('/checkout', checkout);
router.get('/orders', getMyOrders);
router.post('/reviews/:productId', createReview);

export default router;
