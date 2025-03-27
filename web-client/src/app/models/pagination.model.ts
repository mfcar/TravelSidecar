export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface QueryParameters {
  page: number;
  pageSize: number;
}
