import { City, KurdishDialect } from '../types';

export interface PrayerInfo {
  key: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  nameKu: string;
  nameBadini: string;
  nameAr: string;
  timeStr: string; // HH:mm
  dateObj: Date;
  isNext: boolean;
  isPassed: boolean;
  isCurrent: boolean;
}

export function getPrayerNames(dialect: KurdishDialect = 'ckb') {
  if (dialect === 'badini') {
    return {
      fajr: 'سپێدە (فەجر)',
      sunrise: 'دەرکەفتنا ڕۆژێ',
      dhuhr: 'نیڤرۆ (نیوەڕۆ)',
      asr: 'ئێڤار (عەسر)',
      maghrib: 'شڤان (مەغریب)',
      isha: 'خەفتن (عیشا)',
      midnight: 'نیڤا شەڤێ (شەڤ نڤێژ)',
    };
  }
  return {
    fajr: 'بەیانی (فەجر)',
    sunrise: 'ڕۆژهەڵات',
    dhuhr: 'نیوەڕۆ',
    asr: 'عەسر',
    maghrib: 'مەغریب (شێوان)',
    isha: 'عیشا (خەوتنان)',
    midnight: 'نیوەشەو (شەونوێژ)',
  };
}

// Convert "HH:mm" to Date on given baseDate
export function parseTimeString(timeStr: string, baseDate: Date = new Date()): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Format 24-hour time "14:30" to 12-hour or 24-hour string
export function formatPrayerTime(timeStr: string, is24Hour: boolean = false, dialect: KurdishDialect = 'ckb'): string {
  if (!timeStr) return '--:--';
  if (is24Hour) return timeStr;

  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? (dialect === 'badini' ? 'د.ن' : 'د.ن') : (dialect === 'badini' ? 'ب.ن' : 'ب.ن');
  const h12 = hours % 12 || 12;
  const mStr = String(minutes).padStart(2, '0');
  return `${h12}:${mStr} ${period}`;
}

// Calculate Next Prayer and Remaining time
export function getNextPrayerStatus(
  prayers: [string, string, string, string, string, string], // [fajr, sunrise, dhuhr, asr, maghrib, isha]
  now: Date = new Date(),
  dialect: KurdishDialect = 'ckb'
) {
  const names = getPrayerNames(dialect);
  const keys: Array<'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'> = [
    'fajr',
    'sunrise',
    'dhuhr',
    'asr',
    'maghrib',
    'isha',
  ];

  const todayPrayers = keys.map((key, i) => {
    return {
      key,
      name: names[key],
      timeStr: prayers[i],
      date: parseTimeString(prayers[i], now),
    };
  });

  // Check if now is before any prayer today
  let nextPrayerIndex = -1;
  for (let i = 0; i < todayPrayers.length; i++) {
    if (todayPrayers[i].date > now) {
      nextPrayerIndex = i;
      break;
    }
  }

  // If passed isha today, next prayer is Fajr tomorrow
  let nextPrayerName = '';
  let nextPrayerKey = '';
  let nextPrayerTime = '';
  let diffMs = 0;

  if (nextPrayerIndex !== -1) {
    const nextP = todayPrayers[nextPrayerIndex];
    nextPrayerKey = nextP.key;
    nextPrayerName = nextP.name;
    nextPrayerTime = nextP.timeStr;
    diffMs = nextP.date.getTime() - now.getTime();
  } else {
    // Tomorrow Fajr
    const tomorrowFajr = parseTimeString(prayers[0], now);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    nextPrayerKey = 'fajr';
    nextPrayerName = names.fajr;
    nextPrayerTime = prayers[0];
    diffMs = tomorrowFajr.getTime() - now.getTime();
  }

  // Current prayer (the one before next prayer)
  let currentPrayerKey = 'isha';
  if (nextPrayerIndex > 0) {
    currentPrayerKey = todayPrayers[nextPrayerIndex - 1].key;
  } else if (nextPrayerIndex === 0) {
    currentPrayerKey = 'isha'; // before fajr, technically isha night
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const countdownFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    nextPrayerKey,
    nextPrayerName,
    nextPrayerTime,
    currentPrayerKey,
    countdownFormatted,
    hoursRemaining: hours,
    minutesRemaining: minutes,
    secondsRemaining: seconds,
    totalRemainingSeconds: Math.max(0, Math.floor(diffMs / 1000)),
  };
}

// Approximate Hijri Date Calculator
export function getHijriDate(date: Date = new Date(), adjustmentDays: number = 0): { day: number; monthNameKu: string; monthNameAr: string; year: number } {
  const d = new Date(date);
  d.setDate(d.getDate() + adjustmentDays);

  // Using Intl Islamic Umalqura calendar if available
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(d);
    let day = 1, month = 1, year = 1447;
    for (const p of parts) {
      if (p.type === 'day') day = parseInt(p.value, 10);
      if (p.type === 'month') month = parseInt(p.value, 10);
      if (p.type === 'year') year = parseInt(p.value, 10);
    }

    const islamicMonthsKu = [
      'موحەڕەم', 'سەفەر', 'ڕەبیعی یەکەم', 'ڕەبیعی دووەم',
      'جومادەلئوولا', 'جومادەلئاخیرە', 'ڕەجەب', 'شەعبان',
      'ڕەمەزانی پیرۆز', 'شەوال', 'زولقەعدە', 'زولحەججە'
    ];
    const islamicMonthsAr = [
      'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
      'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
      'رمضان المبارك', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];

    return {
      day,
      monthNameKu: islamicMonthsKu[(month - 1) % 12] || 'ڕەمەزان',
      monthNameAr: islamicMonthsAr[(month - 1) % 12] || 'رمضان',
      year,
    };
  } catch {
    return {
      day: 15,
      monthNameKu: 'ڕەمەزانی پیرۆز',
      monthNameAr: 'رمضان المبارك',
      year: 1447,
    };
  }
}

// Distance to Kaaba (Mecca) in Kilometers
export function getDistanceToKaaba(city: City): number {
  const R = 6371; // Earth radius in km
  const meccaLat = (21.4225 * Math.PI) / 180;
  const meccaLon = (39.8262 * Math.PI) / 180;
  const lat1 = (city.lat * Math.PI) / 180;
  const lon1 = (city.lon * Math.PI) / 180;

  const dLat = meccaLat - lat1;
  const dLon = meccaLon - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(meccaLat) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
