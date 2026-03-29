import { z } from 'zod';

// ---------------------------------------------------------------------------
// Date range query (shared by both report endpoints)
// ---------------------------------------------------------------------------

export const DateRangeQuerySchema = z.object({
  from: z.string().datetime({ message: 'from must be a valid ISO datetime' }).optional(),
  to: z.string().datetime({ message: 'to must be a valid ISO datetime' }).optional(),
});

export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
