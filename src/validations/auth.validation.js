import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(50),
  role: z.enum(['user', 'admin']).default('user'),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(50),
});
