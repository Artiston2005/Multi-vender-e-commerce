import { Router } from 'express';
import { getPublicProducts, getProductById, getCategories } from '../controllers/publicController';

const router = Router();

router.get('/products/categories', getCategories);
router.get('/products/:id', getProductById);
router.get('/products', getPublicProducts);

export default router;
