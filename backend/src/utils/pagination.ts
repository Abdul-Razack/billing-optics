export interface PaginationMeta {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function getPaginationParams(page: number | undefined, limit: number | undefined) {
  const parsedPage = page && page > 0 ? page : 1;
  const parsedLimit = limit && limit > 0 && limit <= 100 ? limit : 10;
  
  return {
    limit: parsedLimit,
    offset: (parsedPage - 1) * parsedLimit,
    page: parsedPage,
  };
}

export function buildPaginatedResponse<T>(data: T[], totalRecords: number, page: number, limit: number): PaginatedResult<T> {
  return {
    data,
    meta: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      pageSize: limit,
    }
  };
}
