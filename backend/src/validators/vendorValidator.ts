import { z } from 'zod';

export const storeSchema = z.object({
  name: z.string().min(3, "Store name must be at least 3 characters long"),
  description: z.string().optional(),
});

export const updateOrderItemStatusSchema = z.object({
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED"])
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters long"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  stock: z.number().int().nonnegative("Stock cannot be negative").default(0),
  category: z.string().min(2, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  variants: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Variant name is required"),
    stock: z.number().int().nonnegative("Variant stock cannot be negative")
  })).optional(),
});

export const updateProductSchema = productSchema.partial();
export const updateStoreSchema = storeSchema.partial();
