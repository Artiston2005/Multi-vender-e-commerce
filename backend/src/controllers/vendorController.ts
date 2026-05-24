import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { storeSchema, productSchema, updateStoreSchema } from '../validators/vendorValidator';

// Get current vendor's store
export const getMyStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
    });

    if (!store) {
      res.status(404).json({ error: 'Store not found. Please create one.' });
      return;
    }

    res.status(200).json({ store });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a store for the vendor
export const createStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    // Check if store already exists
    const existingStore = await prisma.store.findUnique({
      where: { ownerId: userId },
    });

    if (existingStore) {
      res.status(409).json({ error: 'You already have a store.' });
      return;
    }

    const parsedData = storeSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ error: parsedData.error.issues });
      return;
    }

    const { name, description } = parsedData.data;

    const store = await prisma.store.create({
      data: {
        ownerId: userId,
        name,
        description: description || null,
        status: 'PENDING', // Will require admin approval based on schema
      },
    });

    res.status(201).json({ store });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update store details
export const updateStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const store = await prisma.store.findUnique({ where: { ownerId: userId } });

    if (!store) {
      res.status(404).json({ error: 'Store not found.' });
      return;
    }

    const parsedData = updateStoreSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({ error: parsedData.error.issues });
      return;
    }

    const updatedStore = await prisma.store.update({
      where: { ownerId: userId },
      data: {
        ...(parsedData.data.name && { name: parsedData.data.name }),
        ...(parsedData.data.description !== undefined && { description: parsedData.data.description || null })
      },
    });

    res.status(200).json({ store: updatedStore });
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new product
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const store = await prisma.store.findUnique({ where: { ownerId: userId } });

    if (!store) {
      res.status(404).json({ error: 'Store not found. Please create a store first.' });
      return;
    }

    const parsedData = productSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ error: parsedData.error.issues });
      return;
    }

    const { name, description, price, stock, category, imageUrl, variants } = parsedData.data;

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        name,
        description: description || '',
        price,
        stock,
        category,
        imageUrl: imageUrl || null,
        variants: {
          create: variants?.map(v => ({ name: v.name, stock: v.stock })) || []
        }
      },
      include: { variants: true }
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all products for the current vendor
export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const store = await prisma.store.findUnique({ where: { ownerId: userId } });

    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a specific product
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const store = await prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    // Verify product exists and belongs to this store
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.storeId !== store.id) {
      res.status(404).json({ error: 'Product not found or unauthorized' });
      return;
    }

    const parsedData = productSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ error: parsedData.error.issues });
      return;
    }

    const { name, description, price, stock, category, imageUrl, variants } = parsedData.data;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || '',
        price,
        stock,
        category,
        imageUrl: imageUrl || null,
      },
    });

    if (variants !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map(v => ({ name: v.name, stock: v.stock, productId: id }))
        });
      }
    }

    res.status(200).json({ product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVendorOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const store = await prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { vendorId: store.id },
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, email: true } }
          }
        },
        product: { select: { name: true, imageUrl: true } }
      },
      orderBy: { order: { createdAt: 'desc' } }
    });

    // Map customer to user for frontend compatibility
    const mappedItems = orderItems.map((item: any) => ({
      ...item,
      order: {
        ...item.order,
        user: item.order.customer
      }
    }));

    res.status(200).json({ orderItems: mappedItems });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderItemStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const store = await prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    const { itemId } = req.params as { itemId: string };
    const { status } = req.body;

    if (!["PENDING", "SHIPPED", "DELIVERED"].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const orderItem = await prisma.orderItem.findUnique({ where: { id: itemId } });
    if (!orderItem || orderItem.vendorId !== store.id) {
      res.status(404).json({ error: 'Order item not found or unauthorized' });
      return;
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { status }
    });

    res.status(200).json({ orderItem: updatedItem });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a specific product
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const store = await prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    // Verify product exists and belongs to this store
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.storeId !== store.id) {
      res.status(404).json({ error: 'Product not found or unauthorized' });
      return;
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
