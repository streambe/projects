import { z } from 'zod';

export const LoginBodySchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterBodySchema = z.object({
  fullName: z.string().min(2).max(150),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});

export const UpdateUserBodySchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  email: z.string().email().toLowerCase().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128).optional(),
});

export type LoginBody = z.infer<typeof LoginBodySchema>;
export type RegisterBody = z.infer<typeof RegisterBodySchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;

/** Shape of the JWT access token payload. */
export interface JwtPayload {
  sub: string;       // user id
  email: string;
  fullName: string;
}
