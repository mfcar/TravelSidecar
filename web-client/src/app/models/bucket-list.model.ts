import { CollectionMatchMode } from './enums/filter-modes.enum';
import { Tag } from './tags.model';

export enum BucketListItemType {
  Destination = 0,
  Activity = 1,
  Accommodation = 2,
  Food = 3,
  Transportation = 4,
  Event = 5,
  Other = 6,
}

export interface BucketListItem {
  id: string;
  name: string;
  description?: string;
  type: BucketListItemType;
  bucketListId?: string;
  startDate?: string;
  startTimeUtc?: string;
  startTimeZoneId?: string;
  endDate?: string;
  endTimeUtc?: string;
  endTimeZoneId?: string;
  originalPrice?: number;
  originalCurrencyCode?: string;
  imageId?: string;
  tags?: Tag[];
  createdAt: string;
}

export interface BucketListItemFilterRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  bucketListId?: string;
  tagIds?: string[];
  tagMatchMode?: CollectionMatchMode;
  types?: BucketListItemType[];
  startDateFrom?: string;
  startDateTo?: string;
}

export interface CreateUpdateBucketListItemRequest {
  name: string;
  type: BucketListItemType;
  description?: string;
  bucketListId?: string;
  startDate?: string;
  startTime?: string;
  startTimeZoneId?: string;
  endDate?: string;
  endTime?: string;
  endTimeZoneId?: string;
  originalPrice?: number;
  originalCurrencyCode?: string;
  tagIds?: string[];
}
