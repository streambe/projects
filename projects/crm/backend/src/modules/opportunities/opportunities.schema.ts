import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums (mirror Prisma schema)
// ---------------------------------------------------------------------------

export const OpportunityStageEnum = z.enum([
  'consulta',
  'prueba_manejo',
  'presupuesto',
  'cierre',
]);

export const OpportunityResultEnum = z.enum(['ganado', 'perdido']);

// ---------------------------------------------------------------------------
// Create opportunity
// ---------------------------------------------------------------------------

export const CreateOpportunitySchema = z.object({
  clientId: z.string().uuid('clientId must be a valid UUID'),
  assignedUserId: z.string().uuid().optional(),
  motoInterest: z.string().min(1, 'motoInterest must not be empty').optional(),
  stage: OpportunityStageEnum.default('consulta'),
});

export type CreateOpportunityBody = z.infer<typeof CreateOpportunitySchema>;

// ---------------------------------------------------------------------------
// Update opportunity (general fields)
// ---------------------------------------------------------------------------

export const UpdateOpportunitySchema = z.object({
  assignedUserId: z.string().uuid().optional(),
  motoInterest: z.string().optional(),
});

export type UpdateOpportunityBody = z.infer<typeof UpdateOpportunitySchema>;

// ---------------------------------------------------------------------------
// Change stage
// ---------------------------------------------------------------------------

export const ChangeStageSchema = z
  .object({
    stage: OpportunityStageEnum,
    result: OpportunityResultEnum.optional(),
    lostReason: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.stage === 'cierre' && !val.result) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'result is required when stage is cierre',
        path: ['result'],
      });
    }
  });

export type ChangeStageBody = z.infer<typeof ChangeStageSchema>;

// ---------------------------------------------------------------------------
// List opportunities query
// ---------------------------------------------------------------------------

export const ListOpportunitiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  stage: OpportunityStageEnum.optional(),
  isOpen: z
    .string()
    .optional()
    .transform((v) => {
      if (v === 'true') return true;
      if (v === 'false') return false;
      return undefined;
    }),
  /**
   * When true, include closed opportunities (result != null) in the kanban list.
   * Defaults to false — closed opportunities are hidden by default.
   */
  includeClosed: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export type ListOpportunitiesQuery = z.infer<typeof ListOpportunitiesQuerySchema>;
