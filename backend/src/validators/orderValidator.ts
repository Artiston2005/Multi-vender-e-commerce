import { z } from 'zod';

export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid("Invalid product ID"),
      variantId: z.string().uuid("Invalid variant ID").optional(),
      quantity: z.number().int().positive("Quantity must be at least 1")
    })
  ).min(1, "Cart cannot be empty")
});
