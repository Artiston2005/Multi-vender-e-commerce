import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { checkoutSchema } from '../validators/orderValidator';

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { 
      res.status(401).json({ error: 'Unauthorized' }); 
      return; 
    }

    const parsedData = checkoutSchema.safeParse(req.body);
    if (!parsedData.success) { 
      res.status(400).json({ error: parsedData.error.issues }); 
      return; 
    }

    const { items } = parsedData.data;

    // We use Prisma $transaction to ensure everything succeeds or fails together
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product not found (ID: ${item.productId})`);
        }

        let variantName = null;

        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (!variant || variant.productId !== product.id) {
            throw new Error(`Invalid variant for ${product.name}`);
          }
          if (variant.stock < item.quantity) {
            throw new Error(`Not enough stock for ${product.name} (${variant.name})`);
          }
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: variant.stock - item.quantity }
          });
          variantName = variant.name;
        } else {
          if (product.stock < item.quantity) {
            throw new Error(`Not enough stock for ${product.name}`);
          }
          // Deduct base product stock
          await tx.product.update({
            where: { id: product.id },
            data: { stock: product.stock - item.quantity }
          });
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          productId: product.id,
          vendorId: product.storeId,
          variantName,
          quantity: item.quantity,
          price: product.price
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          customerId: userId,
          totalAmount,
          status: 'PAID', // Instant checkout simulation
          orderItems: {
            create: orderItemsData
          }
        },
        include: { orderItems: true }
      });

      return newOrder;
    });

    res.status(201).json({ order, message: 'Checkout successful!' });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(400).json({ error: error.message || 'Checkout failed' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const orders = await prisma.order.findMany({
      where: { customerId: req.user!.userId },
      include: {
        orderItems: {
          include: {
            product: { select: { name: true, imageUrl: true } },
            vendor: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { productId } = req.params as { productId: string };
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    // Verify customer has ordered this product and it is delivered
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { customerId: userId },
        status: 'DELIVERED'
      }
    });

    if (!hasOrdered) {
      res.status(403).json({ error: 'You can only review products you have purchased and received.' });
      return;
    }

    // Upsert review (create or update existing)
    const review = await prisma.review.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      update: {
        rating,
        comment
      },
      create: {
        userId,
        productId,
        rating,
        comment
      }
    });

    res.status(200).json({ review, message: 'Review submitted successfully!' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
