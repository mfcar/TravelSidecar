export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  lastModifiedAt: Date;
  lastActiveAt?: Date;
}

export interface UserFilterRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
