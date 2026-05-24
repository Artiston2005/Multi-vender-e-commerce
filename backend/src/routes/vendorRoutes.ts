import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/authMiddleware';
import {
  getMyStore,
  createStore,
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  updateStore,
  getVendorOrders,
  updateOrderItemStatus
} from '../controllers/vendorController';

const router = Router();

// Apply authentication and restrict all routes to VENDOR role
router.use(authenticate, requireRole(['VENDOR']));

// Store routes
router.get('/store', getMyStore);
router.post('/store', createStore);
router.put('/store', updateStore);

// Product CRUD routes
router.post('/products', createProduct);
router.get('/products', getMyProducts);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Vendor Order Management
router.get('/orders', getVendorOrders);
router.put('/orders/:itemId/status', updateOrderItemStatus);

export default router;
