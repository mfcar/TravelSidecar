export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  lastModifiedAt: string;
  lastActiveAt?: string;
}

export interface UserFilterRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
