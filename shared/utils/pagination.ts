/**
 * Pagination utilities for Supabase queries.
 */

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

/**
 * Parse pagination query parameters with defaults and clamping.
 * - page: defaults to 1, minimum 1
 * - perPage: defaults to 50, clamped to 1-100
 */
export function parsePagination(query: { page?: string; perPage?: string }): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(query.perPage || '50', 10) || 50));
  return { page, perPage };
}

/**
 * Calculate Supabase .range() arguments from pagination params.
 * Returns [from, to] (0-indexed, inclusive on both ends).
 */
export function paginationRange(params: PaginationParams): [number, number] {
  const from = (params.page - 1) * params.perPage;
  const to = from + params.perPage - 1;
  return [from, to];
}

/**
 * Build a PaginatedResponse from query results.
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  return {
    data,
    total,
    page: params.page,
    perPage: params.perPage,
    hasMore: params.page * params.perPage < total,
  };
}
