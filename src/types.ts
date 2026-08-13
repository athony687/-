export interface Library {
  id: string;
  name: string;
  kanaName?: string;
  type: 'prefectural' | 'municipal'; // 県立 or 市立・町立
  municipality: string; // e.g. さいたま市大宮区, 川越市, 川口市
  address: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  opacUrl?: string; // 蔵書検索URL
  openingHours: string;
  closedDays: string;
  nearestStation: string;
  accessInfo: string;
  parking: string;
  hasParking: boolean;
  hasWifi: boolean;
  hasStudySeats: boolean;
  hasCafeOrRestArea: boolean;
  hasKidsArea: boolean;
  hasNursingRoom: boolean;
  hasBarrierFree: boolean;
  hasAvSection: boolean;
  isOpenNight: boolean; // 20時以降も開館
  bookCount: number; // 蔵書数 (約○万冊)
  features: string[];
  description: string;
}

export interface FilterState {
  keyword: string;
  municipality: string;
  type: 'all' | 'prefectural' | 'municipal';
  hasWifi: boolean;
  hasStudySeats: boolean;
  hasParking: boolean;
  hasKidsArea: boolean;
  isOpenNight: boolean;
  isOpenToday: boolean;
  sortBy: 'distance' | 'name' | 'bookCount';
}

export interface UserLocation {
  lat: number;
  lng: number;
  addressName?: string;
}

export interface AiRecommendationResponse {
  answer: string;
  recommendedLibraryIds: string[];
  suggestedTopics?: string[];
}
