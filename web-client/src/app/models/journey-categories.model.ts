import { Journey } from './journeys.model';

export interface JourneyCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  lastModifiedAt: Date;
  journeysCount: number;
  journeys: Journey[];
}

export interface CreateUpdateJourneyCategoryRequest {
  name: string;
  description?: string;
}

export interface JourneyCategoryFilterRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeUncategorized?: boolean;
  hasJourneys?: boolean;
}
