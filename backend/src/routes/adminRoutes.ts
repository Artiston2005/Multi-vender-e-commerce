import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/authMiddleware';
import { getStores, updateStoreStatus } from '../controllers/adminController';

const router = Router();

router.use(authenticate, requireRole(['ADMIN']));

router.get('/stores', getStores);
router.put('/stores/:id/status', updateStoreStatus);

export default router;
