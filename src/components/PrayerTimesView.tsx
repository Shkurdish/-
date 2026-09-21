import React, { useState, useMemo } from 'react';
import { City, KurdishDialect, AppSettings } from '../types';
import {
  getNextPrayerStatus,
  formatPrayerTime,
  getPrayerNames,
  getHijriDate,
} from '../utils/prayerUtils';
import {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Clock,
  Volume2,
  Calendar,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Play,
  Pause,
} from 'lucide-react';

interface PrayerTimesViewProps {
  selectedCity: City;
  allCities: City[];
  onSelectCity: (city: City) => void;
  onOpenCityPicker: () => void;
  prayerTimesForCity: Record<string, [string, string, string, string, string, string]> | null;
  dialect: KurdishDialect;
  settings: AppSettings;
  currentTime: Date;
  onPlayAdhan: (trackId?: string) => void;
  isPlayingAdhan: boolean;
}

export const PrayerTimesView: React.FC<PrayerTimesViewProps> = ({
  selectedCity,
  allCities,
  onSelectCity,
  onOpenCityPicker,
  prayerTimesForCity,
  dialect,
  settings,
  currentTime,
  onPlayAdhan,
  isPlayingAdhan,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMonthlyCalendar, setShowMonthlyCalendar] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Month-Day format "MM-DD"
  const dateKey = useMemo(() => {
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${m}-${d}`;
  }, [selectedDate]);

  const isToday = useMemo(() => {
    return selectedDate.toDateString() === currentTime.toDateString();
  }, [selectedDate, currentTime]);

  // Times array for current selected date [fajr, sunrise, dhuhr, asr, maghrib, isha]
  const rawTimes = useMemo(() => {
    if (!prayerTimesForCity || !prayerTimesForCity[dateKey]) {
      return ['05:00', '06:30', '12:15', '15:30', '18:15', '19:45'] as [
        string,
        string,
        string,
        string,
        string,
        string,
      ];
    }
    return prayerTimesForCity[dateKey];
  }, [prayerTimesForCity, dateKey]);

  // Apply minute adjustments if any from settings
  const adjustedTimes = useMemo(() => {
    const adj = settings.prayerAdjustments;
    const addMinutes = (timeStr: string, minutesToAdd: number) => {
      if (!minutesToAdd) return timeStr;
      const [h, m] = timeStr.split(':').map(Number);
      const totalM = (h * 60 + m + minutesToAdd + 1440) % 1440;
      const nh = Math.floor(totalM / 60);
      const nm = totalM % 60;
      return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
    };

    return [
      addMinutes(rawTimes[0], adj.fajr),
      addMinutes(rawTimes[1], adj.sunrise),
      addMinutes(rawTimes[2], adj.dhuhr),
      addMinutes(rawTimes[3], adj.asr),
      addMinutes(rawTimes[4], adj.maghrib),
      addMinutes(rawTimes[5], adj.isha),
    ] as [string, string, string, string, string, string];
  }, [rawTimes, settings.prayerAdjustments]);

  // Next prayer status
  const prayerStatus = useMemo(() => {
    return getNextPrayerStatus(adjustedTimes, currentTime, dialect);
  }, [adjustedTimes, currentTime, dialect]);

  // Prayer names in selected dialect
  const names = getPrayerNames(dialect);

  // Calculate midnight (Tahajjud / Qiyam al layl) approx: midpoint between Maghrib and Fajr
  const midnightTimeStr = useMemo(() => {
    const [mh, mm] = adjustedTimes[4].split(':').map(Number);
    const [fh, fm] = adjustedTimes[0].split(':').map(Number);
    let maghribMin = mh * 60 + mm;
    let fajrMin = fh * 60 + fm;
    if (fajrMin < maghribMin) fajrMin += 1440;
    const midMin = Math.round(maghribMin + (fajrMin - maghribMin) / 2) % 1440;
    const nh = Math.floor(midMin / 60);
    const nm = midMin % 60;
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
  }, [adjustedTimes]);

  const prayersList = [
    {
      key: 'fajr',
      nameKu: names.fajr,
      nameAr: 'الفجر',
      time: adjustedTimes[0],
      icon: Moon,
      color: 'from-blue-600/30 to-indigo-900/40 text-blue-400 border-blue-500/30',
      activeBorder: 'border-blue-400 ring-2 ring-blue-500/30 bg-blue-950/40',
    },
    {
      key: 'sunrise',
      nameKu: names.sunrise,
      nameAr: 'الشروق',
      time: adjustedTimes[1],
      icon: Sunrise,
      color: 'from-amber-600/30 to-orange-900/40 text-amber-400 border-amber-500/30',
      activeBorder: 'border-amber-400 ring-2 ring-amber-500/30 bg-amber-950/40',
    },
    {
      key: 'dhuhr',
      nameKu: names.dhuhr,
      nameAr: 'الظهر',
      time: adjustedTimes[2],
      icon: Sun,
      color: 'from-yellow-600/30 to-amber-900/40 text-yellow-400 border-yellow-500/30',
      activeBorder: 'border-yellow-400 ring-2 ring-yellow-500/30 bg-yellow-950/40',
    },
    {
      key: 'asr',
      nameKu: names.asr,
      nameAr: 'العصر',
      time: adjustedTimes[3],
      icon: Sun,
      color: 'from-orange-600/30 to-red-900/40 text-orange-400 border-orange-500/30',
      activeBorder: 'border-orange-400 ring-2 ring-orange-500/30 bg-orange-950/40',
    },
    {
      key: 'maghrib',
      nameKu: names.maghrib,
      nameAr: 'المغرب',
      time: adjustedTimes[4],
      icon: Sunset,
      color: 'from-rose-600/30 to-pink-900/40 text-rose-400 border-rose-500/30',
      activeBorder: 'border-rose-400 ring-2 ring-rose-500/30 bg-rose-950/40',
    },
    {
      key: 'isha',
      nameKu: names.isha,
      nameAr: 'العشاء',
      time: adjustedTimes[5],
      icon: Moon,
      color: 'from-indigo-600/30 to-purple-900/40 text-indigo-400 border-indigo-500/30',
      activeBorder: 'border-indigo-400 ring-2 ring-indigo-500/30 bg-indigo-950/40',
    },
  ];

  // Popular Kurdistan cities for quick chips
  const quickCities = useMemo(() => {
    return allCities.filter((c) =>
      [77359, 77382, 77340, 77385, 77396, 77336, 77376, 77398].includes(c.id)
    );
  }, [allCities]);

  // Date controls
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Copy times to clipboard
  const handleCopyTimes = () => {
    const hijri = getHijriDate(selectedDate, settings.hijriAdjustment);
    const text = `🕌 کاتەکانی بانگ لە ${selectedCity.nameKu} بۆ ڕۆژی ${selectedDate.toLocaleDateString()}:\n` +
      `بەیانی: ${adjustedTimes[0]}\n` +
      `ڕۆژهەڵات: ${adjustedTimes[1]}\n` +
      `نیوەڕۆ: ${adjustedTimes[2]}\n` +
      `عەسر: ${adjustedTimes[3]}\n` +
      `مەغریب: ${adjustedTimes[4]}\n` +
      `عیشا: ${adjustedTimes[5]}\n` +
      `مێژووی کۆچی: ${hijri.day}ی ${hijri.monthNameKu} ${hijri.year}\n` +
      `بەرنامەی نوێژەکانم 🌙`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Monthly table generator
  const monthlyData = useMemo(() => {
    if (!prayerTimesForCity) return [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const key = `${mStr}-${dStr}`;
      const times = prayerTimesForCity[key] || ['--', '--', '--', '--', '--', '--'];
      result.push({
        day,
        key,
        date: new Date(year, month, day),
        times,
      });
    }
    return result;
  }, [prayerTimesForCity, selectedDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Quick City Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          {dialect === 'badini' ? 'باژێرێن سەرەکی:' : 'شارەکان:'}
        </span>
        {quickCities.map((city) => {
          const isSelected = city.id === selectedCity.id;
          return (
            <button
              key={city.id}
              onClick={() => onSelectCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {city.nameKu}
            </button>
          );
        })}
        <button
          onClick={onOpenCityPicker}
          className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap bg-slate-800/80 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1"
        >
          <span>{dialect === 'badini' ? 'هەمی باژێر' : 'هەموو شارەکان'} (١٢٥)</span>
        </button>
      </div>

      {/* Hero: Next Prayer Countdown Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: City & Next Prayer Details */}
          <div className="text-center md:text-right space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isToday
                  ? dialect === 'badini'
                    ? 'نڤێژا ل پێش'
                    : 'نوێژی داهاتوو'
                  : dialect === 'badini'
                  ? 'دەمێن نڤێژێ یێن ڤێ ڕۆژێ'
                  : 'کاتەکانی نوێژ بۆ ئەم بەروارە'}
              </span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
                {prayerStatus.nextPrayerName}
              </h2>
              <p className="text-slate-400 text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                <span>لە {selectedCity.nameKu}</span>
                <span>•</span>
                <span>
                  کاتژمێر:{' '}
                  <strong className="text-emerald-300 font-mono text-base">
                    {formatPrayerTime(prayerStatus.nextPrayerTime, settings.timeFormat24, dialect)}
                  </strong>
                </span>
              </p>
            </div>

            {/* Quick Listen Button to hear Adhan */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onPlayAdhan()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg ${
                  isPlayingAdhan
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/30 animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                {isPlayingAdhan ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>وەستاندنی بانگ</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>گوێگرتن لە بانگی کوردی (پێشەوا قادر)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Countdown Counter */}
          <div className="flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {dialect === 'badini' ? 'ماوە بۆ بانگێ:' : 'ماوە بۆ بانگ:'}
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono tracking-wider text-emerald-400 drop-shadow-sm dir-ltr">
              {prayerStatus.countdownFormatted}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {prayerStatus.hoursRemaining} کاتژمێر و {prayerStatus.minutesRemaining} خولەک
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigator & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
        {/* Day switch controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="ڕۆژی پێشوو"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              isToday
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {dialect === 'badini' ? 'ئەڤڕۆ' : 'ئەمڕۆ'}
          </button>
          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="ڕۆژی دواتر"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-semibold text-slate-200 pr-2">
            {selectedDate.toLocaleDateString('ckb-IQ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* View full monthly calendar and Copy */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTimes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            title="کۆپیکردنی کاتەکان"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copySuccess ? 'کۆپیکرا!' : 'هاوبەشکردن'}</span>
          </button>

          <button
            onClick={() => setShowMonthlyCalendar(!showMonthlyCalendar)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
              showMonthlyCalendar
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{showMonthlyCalendar ? 'شاردنەوەی تەشتە' : 'تەواوی مانگ'}</span>
          </button>
        </div>
      </div>

      {/* 6 Main Prayer Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {prayersList.map((prayer) => {
          const Icon = prayer.icon;
          const isNext = isToday && prayerStatus.nextPrayerKey === prayer.key;
          const isCurrent = isToday && prayerStatus.currentPrayerKey === prayer.key;

          return (
            <div
              key={prayer.key}
              className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                isNext
                  ? `${prayer.activeBorder} shadow-lg shadow-emerald-500/10 scale-[1.02]`
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-750'
              }`}
            >
              {/* Badge for Next / Current */}
              {isNext && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>داهاتوو</span>
                </div>
              )}

              {/* Prayer Name & Icon */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${prayer.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-arabic text-slate-500">{prayer.nameAr}</span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-200">
                  {prayer.nameKu}
                </h3>
              </div>

              {/* Time */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="font-mono text-xl sm:text-2xl font-extrabold text-slate-100">
                  {formatPrayerTime(prayer.time, settings.timeFormat24, dialect)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {prayer.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extra: Midnight / Tahajjud (شەونوێژ) Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400">
              {dialect === 'badini' ? 'نیڤا شەڤێ (شەڤ نڤێژ و قیام اللیل):' : 'نیوەشەوی شەرعی (شەونوێژ و قیام اللیل):'}
            </span>
            <div className="font-bold text-slate-200 text-sm">
              نیوەشەو کاتژمێر{' '}
              <span className="font-mono text-emerald-400">
                {formatPrayerTime(midnightTimeStr, settings.timeFormat24, dialect)}
              </span>
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          ناوەڕاستی کاتی مەغریب تا بەیانی
        </span>
      </div>

      {/* Monthly / Ramadan Calendar View */}
      {showMonthlyCalendar && (
        <div className="mt-6 rounded-3xl bg-slate-900 border border-slate-800 p-5 overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-lg text-slate-100">
                {dialect === 'badini'
                  ? `خشتەیا دەمێن نڤێژێ بۆ مەها ${selectedDate.getMonth() + 1} ل ${selectedCity.nameKu}`
                  : `خشتەی کاتەکانی نوێژ بۆ مانگی ${selectedDate.getMonth() + 1} لە ${selectedCity.nameKu}`}
              </h3>
              <p className="text-xs text-slate-400">
                پشتڕاستکراوە لە داتابەیسی فەرمی بەرنامەی نوێژەکانم
              </p>
            </div>
            <button
              onClick={() => setShowMonthlyCalendar(false)}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-800"
            >
              داخستن
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">ڕۆژ</th>
                  <th className="py-2.5 px-3">بەروار</th>
                  <th className="py-2.5 px-3 text-blue-400">بەیانی</th>
                  <th className="py-2.5 px-3 text-amber-400">ڕۆژهەڵات</th>
                  <th className="py-2.5 px-3 text-yellow-400">نیوەڕۆ</th>
                  <th className="py-2.5 px-3 text-orange-400">عەسر</th>
                  <th className="py-2.5 px-3 text-rose-400">مەغریب</th>
                  <th className="py-2.5 px-3 text-indigo-400">عیشا</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {monthlyData.map((row) => {
                  const isCurrentRow =
                    isToday && row.day === currentTime.getDate() && selectedDate.getMonth() === currentTime.getMonth();
                  return (
                    <tr
                      key={row.day}
                      className={`transition hover:bg-slate-800/40 ${
                        isCurrentRow ? 'bg-emerald-500/15 font-bold text-emerald-300' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 font-sans">{row.day}</td>
                      <td className="py-2 px-3 text-slate-400">{row.key}</td>
                      <td className="py-2 px-3">{row.times[0]}</td>
                      <td className="py-2 px-3">{row.times[1]}</td>
                      <td className="py-2 px-3">{row.times[2]}</td>
                      <td className="py-2 px-3">{row.times[3]}</td>
                      <td className="py-2 px-3">{row.times[4]}</td>
                      <td className="py-2 px-3">{row.times[5]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
