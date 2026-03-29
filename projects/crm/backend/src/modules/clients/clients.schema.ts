import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums (mirror Prisma schema)
// ---------------------------------------------------------------------------

export const HowFoundUsEnum = z.enum([
  'instagram',
  'facebook',
  'google',
  'referido',
  'visita_directa',
  'otro',
]);

// ---------------------------------------------------------------------------
// Create client
// ---------------------------------------------------------------------------

export const CreateClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dni: z.string().min(1, 'DNI is required').max(20),
  phonePrimary: z.string().min(1, 'Primary phone is required').max(30),
  phoneAlt: z.string().max(30).optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  whatsappNumber: z.string().max(30).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  birthDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  howFoundUs: HowFoundUsEnum.optional(),
  notes: z.string().optional(),
});

export type CreateClientBody = z.infer<typeof CreateClientSchema>;

// ---------------------------------------------------------------------------
// Update client
// ---------------------------------------------------------------------------

export const UpdateClientSchema = CreateClientSchema.partial();

export type UpdateClientBody = z.infer<typeof UpdateClientSchema>;

// ---------------------------------------------------------------------------
// List clients query
// ---------------------------------------------------------------------------

export const ListClientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => {
      if (v === 'true') return true;
      if (v === 'false') return false;
      return undefined;
    }),
});

export type ListClientsQuery = z.infer<typeof ListClientsQuerySchema>;
