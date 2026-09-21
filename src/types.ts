export interface City {
  id: number;
  nameEn: string;
  nameKu: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  qibla: number;
}

export type PrayerTimesMap = Record<string, [string, string, string, string, string, string]>; // MM-DD -> [fajr, sunrise, dhuhr, asr, maghrib, isha]

export interface PrayerDayTimes {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface AllahName {
  id: number;
  arabic: string;
  ckb: string;
  badini: string;
  en: string;
  ar: string;
}

export interface AzkarItem {
  id: number;
  item: string;
  translationCkb: string;
  translationBadini: string;
  translationEn: string;
  reference: string;
  count: number;
}

export interface AzkarChapter {
  id: number;
  nameCkb: string;
  nameBadini: string;
  nameAr: string;
  nameEn: string;
  items: AzkarItem[];
}

export interface AzkarCategory {
  id: number;
  nameCkb: string;
  nameBadini: string;
  nameAr: string;
  nameEn: string;
  chapters: AzkarChapter[];
}

export interface AudioTrack {
  id: string;
  titleKu: string;
  titleAr: string;
  reciter: string;
  src: string;
  tag: 'adhan' | 'fajr_adhan' | 'recitation' | 'nasheed';
}

export type KurdishDialect = 'ckb' | 'badini';

export interface AppSettings {
  dialect: KurdishDialect;
  selectedCityId: number;
  timeFormat24: boolean;
  selectedAdhanId: string;
  prayerAdjustments: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  hijriAdjustment: number;
}
