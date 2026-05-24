import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@marketplace.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      name: 'Tech Haven',
      email: 'vendor1@marketplace.com',
      passwordHash,
      role: 'VENDOR',
    },
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      name: 'Fashion Hub',
      email: 'vendor2@marketplace.com',
      passwordHash,
      role: 'VENDOR',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Ashwin Yadav',
      email: 'customer1@gmail.com',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  // 3. Create Stores
  const store1 = await prisma.store.create({
    data: {
      ownerId: vendorUser1.id,
      name: 'Tech Haven Electronics',
      description: 'Your one-stop shop for the latest gadgets and electronics.',
      status: 'APPROVED',
    },
  });

  const store2 = await prisma.store.create({
    data: {
      ownerId: vendorUser2.id,
      name: 'Fashion Hub Apparels',
      description: 'Trendy fashion for everyone.',
      status: 'APPROVED',
    },
  });

  // 4. Create Products
  const product1 = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Wireless Noise-Cancelling Headphones',
      description: 'Premium headphones with active noise cancellation and 30-hour battery life.',
      price: 15999,
      stock: 50,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      storeId: store1.id,
      name: 'Smart Watch Series 8',
      description: 'Track your fitness, heart rate, and stay connected on the go.',
      price: 24999,
      stock: 0,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      variants: {
        create: [
          { name: 'Space Gray / 44mm', stock: 15 },
          { name: 'Silver / 40mm', stock: 5 },
          { name: 'Gold / 44mm', stock: 0 },
        ],
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      storeId: store2.id,
      name: 'Classic Denim Jacket',
      description: 'A timeless denim jacket that goes well with any casual outfit.',
      price: 3499,
      stock: 0,
      category: 'Clothing',
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
      variants: {
        create: [
          { name: 'Small', stock: 10 },
          { name: 'Medium', stock: 20 },
          { name: 'Large', stock: 15 },
        ],
      },
    },
  });

  const product4 = await prisma.product.create({
    data: {
      storeId: store2.id,
      name: 'Running Sneakers',
      description: 'Lightweight and comfortable running shoes for your daily workout.',
      price: 4999,
      stock: 0,
      category: 'Footwear',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      variants: {
        create: [
          { name: 'UK 7', stock: 5 },
          { name: 'UK 8', stock: 8 },
          { name: 'UK 9', stock: 12 },
          { name: 'UK 10', stock: 4 },
        ],
      },
    },
  });

  // 5. Create Sample Order & Review
  const order = await prisma.order.create({
    data: {
      customerId: customer1.id,
      totalAmount: 15999,
      status: 'PAID',
      orderItems: {
        create: [
          {
            productId: product1.id,
            vendorId: store1.id,
            quantity: 1,
            price: 15999,
            status: 'DELIVERED', // Must be delivered for review to work
          },
        ],
      },
    },
  });

  // Create a review for product1 since it's delivered
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Absolutely love these headphones! The noise cancellation is unreal.',
      userId: customer1.id,
      productId: product1.id,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
