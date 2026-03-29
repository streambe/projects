import { z } from 'zod';

// ---------------------------------------------------------------------------
// Date range query (shared by both report endpoints)
// ---------------------------------------------------------------------------

export const DateRangeQuerySchema = z
  .object({
    from: z.string().datetime({ message: 'from must be a valid ISO datetime' }).optional(),
    to: z.string().datetime({ message: 'to must be a valid ISO datetime' }).optional(),
  })
  .refine(
    (data) => {
      if (data.from !== undefined && data.to !== undefined) {
        return new Date(data.from) <= new Date(data.to);
      }
      return true;
    },
    { message: "'from' must be before or equal to 'to'" },
  );

export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
