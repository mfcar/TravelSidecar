import { CollectionMatchMode } from './enums/filter-modes.enum';
import { JourneyStatus } from './enums/journey-status.enum';
import { Tag } from './tags.model';

export interface Journey {
  id: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  categoryId: string;
  categoryName: string;
  daysUntilStart?: number;
  journeyDurationInDays?: number;
  status: JourneyStatus;
  createdAt: Date;
  lastModifiedAt: Date;
  tags?: Tag[];
  coverImageId?: string;
  bannerImage?: string;
}

export interface JourneyImage {
  id: string;
  journeyId: string;
  url: string;
  fileName: string;
  contentType: string;
  sizeInBytes: number;
  createdAt: Date;
}

export interface CreateUpdateJourneyRequest {
  name: string;
  description?: string;
  startDay: number;
  startMonth: number;
  startYear: number;
  endDay: number;
  endMonth: number;
  endYear: number;
  categoryId?: string;
  tagIds?: string[];
}

export interface JourneysFilterRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categoryId?: string;
  tagIds?: string[];
  tagMatchMode?: CollectionMatchMode;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}
