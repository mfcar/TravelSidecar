export interface FieldOption {
  id: string;
  label: string;
}

export interface SortChangeEvent {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface SortField {
  field: string;
  name: string;
  type: 'text' | 'number';
}
