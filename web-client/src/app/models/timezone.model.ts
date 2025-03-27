export interface TimezoneListResponse {
  items: Timezone[];
  totalCount: number;
}

export interface Timezone {
  id: string;
  gmtOffset: string;
  //   displayName: string;
  //   standardName: string;
  //   baseUtcOffset: string;
  //   supportsDaylightSavingTime: boolean;
}
