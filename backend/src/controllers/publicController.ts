import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getPublicProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, minPrice, maxPrice, sortBy } = req.query;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    if (category) {
      whereClause.category = category as string;
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice as string);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice as string);
    }

    let orderByClause: any = { createdAt: 'desc' }; // default newest
    if (sortBy === 'price_asc') {
      orderByClause = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderByClause = { price: 'desc' };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        store: {
          select: { name: true }
        },
        variants: true,
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: orderByClause
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching global products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: { name: true }
        },
        variants: true,
        reviews: {
          include: {
            user: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    res.status(200).json({ categories: categories.map(c => c.category) });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
