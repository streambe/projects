import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums (mirror Prisma schema)
// ---------------------------------------------------------------------------

export const ActivityTypeEnum = z.enum(['llamada', 'reunion', 'tarea']);
export const ActivityStatusEnum = z.enum(['pendiente', 'realizada']);

// ---------------------------------------------------------------------------
// Create activity
// ---------------------------------------------------------------------------

export const CreateActivitySchema = z.object({
  type: ActivityTypeEnum,
  title: z.string().min(1, 'Title is required').max(255),
  clientId: z.string().uuid('clientId must be a valid UUID'),
  opportunityId: z.string().uuid().optional(),
  // Optional — defaults to the authenticated user's id when omitted
  responsibleUserId: z.string().uuid('responsibleUserId must be a valid UUID').optional(),
  scheduledAt: z.string().datetime('scheduledAt must be a valid ISO datetime'),
  dueAt: z.string().datetime().optional(),
  summary: z.string().optional(),
});

export type CreateActivityBody = z.infer<typeof CreateActivitySchema>;

// ---------------------------------------------------------------------------
// Update activity
// ---------------------------------------------------------------------------

export const UpdateActivitySchema = z.object({
  type: ActivityTypeEnum.optional(),
  title: z.string().min(1).max(255).optional(),
  opportunityId: z.string().uuid().optional(),
  responsibleUserId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime().optional(),
  dueAt: z.string().datetime().optional(),
  summary: z.string().optional(),
});

export type UpdateActivityBody = z.infer<typeof UpdateActivitySchema>;

// ---------------------------------------------------------------------------
// Complete activity
// ---------------------------------------------------------------------------

export const CompleteActivitySchema = z.object({
  summary: z.string().optional(),
});

export type CompleteActivityBody = z.infer<typeof CompleteActivitySchema>;

// ---------------------------------------------------------------------------
// List activities query
// ---------------------------------------------------------------------------

export const ListActivitiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: ActivityStatusEnum.optional(),
  type: ActivityTypeEnum.optional(),
  assignedTo: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  overdue: z
    .string()
    .optional()
    .transform((v) => v === 'true')
    .pipe(z.boolean().optional()),
});

export type ListActivitiesQuery = z.infer<typeof ListActivitiesQuerySchema>;
