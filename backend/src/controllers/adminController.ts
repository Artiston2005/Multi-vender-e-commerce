import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getStores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stores = await prisma.store.findMany({
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    // For frontend compatibility, map owner to vendor
    const mappedStores = stores.map(store => ({
      ...store,
      vendor: store.owner
    }));
    res.status(200).json({ stores: mappedStores });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStoreStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const store = await prisma.store.update({
      where: { id },
      data: { status }
    });
    res.status(200).json({ store });
  } catch (error) {
    console.error('Update store status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
