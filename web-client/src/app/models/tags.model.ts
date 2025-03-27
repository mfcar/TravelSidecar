import { Journey } from './journeys.model';

export interface CreateUpdateTagRequest {
  name: string;
  color: string;
}

export interface TagResponse {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  lastModifiedAt: Date;
  journeysCount: number;
  bucketListItemCount: number;
  journeysList: Journey[];
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface TagFilterRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  usedInJourneys?: boolean;
  usedInBucketListItems?: boolean;
}
