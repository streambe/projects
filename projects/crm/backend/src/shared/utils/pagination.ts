export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Returns Prisma-compatible skip/take values from page-based pagination params.
 */
export function getPrismaPageParams(params: PaginationParams): {
  skip: number;
  take: number;
} {
  const page = Math.max(1, params.page);
  const limit = Math.min(100, Math.max(1, params.limit));
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Wraps a query result with pagination metadata.
 */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  const limit = Math.min(100, Math.max(1, params.limit));
  return {
    data,
    meta: {
      page: params.page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
