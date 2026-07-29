import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin']).optional(),
});
