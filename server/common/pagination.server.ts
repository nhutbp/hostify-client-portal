export type PaginationInput = {
  page: number
  limit: number
}

export function getPagination(input: PaginationInput) {
  return {
    skip: (input.page - 1) * input.limit,
    take: input.limit,
  }
}

export function createPaginationMeta(total: number, input: PaginationInput) {
  const totalPages = Math.max(1, Math.ceil(total / input.limit))
  return {
    page: input.page,
    limit: input.limit,
    total,
    totalPages,
    hasPrevious: input.page > 1,
    hasNext: input.page < totalPages,
  }
}
