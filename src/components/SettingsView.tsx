import React from 'react';
import { AppSettings, KurdishDialect } from '../types';
import { AUDIO_TRACKS } from '../data/audioList';
import {
  Settings,
  Languages,
  Clock,
  Volume2,
  Calendar,
  Sliders,
  Info,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  dialect: KurdishDialect;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  dialect,
}) => {
  const handleResetAdjustments = () => {
    onUpdateSettings({
      prayerAdjustments: {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      },
      hijriAdjustment: 0,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Settings className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            {dialect === 'badini' ? 'ڕێکخستنێن بەرنامەی' : 'ڕێکخستنەکانی بەرنامە'}
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          تایبەتمەندییەکان و کاتەکان بەپێی ویستی خۆت دەستکاری بکە
        </p>
      </div>

      {/* Language / Dialect */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Languages className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-sm text-slate-200">شێوەزاری زمانی کوردی</span>
              <p className="text-xs text-slate-400">
                هەڵبژاردنی نێوان سۆرانی و بادینی بۆ ناوەکان و ئەزکار
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => onUpdateSettings({ dialect: 'ckb' })}
            className={`p-3 rounded-2xl border text-sm font-semibold transition text-center ${
              settings.dialect === 'ckb'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            کوردی سۆرانی (ناوەڕاست)
          </button>

          <button
            onClick={() => onUpdateSettings({ dialect: 'badini' })}
            className={`p-3 rounded-2xl border text-sm font-semibold transition text-center ${
              settings.dialect === 'badini'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            کوردی بادینی (کرمانجی ژووری)
          </button>
        </div>
      </div>

      {/* Time Format 12 vs 24 */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-bold text-sm text-slate-200">شێوازی پیشاندانی کاتژمێر</span>
            <p className="text-xs text-slate-400">
              سیستەمی ١٢ کاتژمێری یان ٢٤ کاتژمێری
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => onUpdateSettings({ timeFormat24: false })}
            className={`p-3 rounded-2xl border text-sm font-semibold transition text-center ${
              !settings.timeFormat24
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            ١٢ کاتژمێری (06:30 د.ن)
          </button>

          <button
            onClick={() => onUpdateSettings({ timeFormat24: true })}
            className={`p-3 rounded-2xl border text-sm font-semibold transition text-center ${
              settings.timeFormat24
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            ٢٤ کاتژمێری (18:30)
          </button>
        </div>
      </div>

      {/* Default Adhan Sound */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-bold text-sm text-slate-200">دەنگی بانگی سەرەکی</span>
            <p className="text-xs text-slate-400">
              ئەو بانگبێژەی دەتەوێت کاتی بانگ لێبدرێت
            </p>
          </div>
        </div>

        <select
          value={settings.selectedAdhanId}
          onChange={(e) => onUpdateSettings({ selectedAdhanId: e.target.value })}
          className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-emerald-500 focus:outline-hidden"
        >
          {AUDIO_TRACKS.filter((t) => t.tag.includes('adhan')).map((t) => (
            <option key={t.id} value={t.id}>
              {t.titleKu}
            </option>
          ))}
        </select>
      </div>

      {/* Prayer Minute Adjustments */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-sm text-slate-200">
                ڕێکخستنی خولەکی کاتەکانی بانگ
              </span>
              <p className="text-xs text-slate-400">
                زیادکردن یان کەمکردنی خولەک بۆ گوند و ناوچە شاخاوییەکان
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAdjustments}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-300"
          >
            <RotateCcw className="w-3 h-3" />
            <span>سفرکردنەوە</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((key) => {
            const labels: Record<string, string> = {
              fajr: 'بەیانی',
              sunrise: 'ڕۆژهەڵات',
              dhuhr: 'نیوەڕۆ',
              asr: 'عەسر',
              maghrib: 'مەغریب',
              isha: 'عیشا',
            };
            const currentVal = settings.prayerAdjustments[key];
            return (
              <div
                key={key}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
              >
                <span className="text-xs font-semibold text-slate-300">{labels[key]}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        prayerAdjustments: {
                          ...settings.prayerAdjustments,
                          [key]: currentVal - 1,
                        },
                      })
                    }
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-mono font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs w-6 text-center text-emerald-400 font-bold">
                    {currentVal > 0 ? `+${currentVal}` : currentVal}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        prayerAdjustments: {
                          ...settings.prayerAdjustments,
                          [key]: currentVal + 1,
                        },
                      })
                    }
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-mono font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hijri Adjustment */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="font-bold text-sm text-slate-200">
              دەستکاریکردنی مێژووی کۆچی (ڕۆژ)
            </span>
            <p className="text-xs text-slate-400">
              بەپێی بینینی مانگی فەرمی لیژنەی بینینی مانگ لە کوردستان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[-2, -1, 0, 1, 2].map((offset) => (
            <button
              key={offset}
              onClick={() => onUpdateSettings({ hijriAdjustment: offset })}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-semibold transition border ${
                settings.hijriAdjustment === offset
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {offset > 0 ? `+${offset}` : offset} ڕۆژ
            </button>
          ))}
        </div>
      </div>

      {/* About App & Database */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs text-slate-400 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>دەربارەی داتاکان و سەرچاوەی بەرنامە:</span>
        </div>
        <p>
          ئەم بەرنامەیە بە شێوەیەکی تایبەت هەموو داتاکانی بەرنامەی نوێژەکانم (My Prayers DB v2.5.1)
          بەکار دەهێنێت، لەوانە:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-300">
          <li>١٢٥ شاری کوردستان، عێراق و جیهان بە کاتی فەرمی ٣٦٦ ڕۆژە</li>
          <li>١٣٣ بەشی ئەزکار و ٢٨٧ فەرموودە و نزای قەڵای موسڵمان بە کوردی سۆرانی و بادینی</li>
          <li>٩٩ ناوی پیرۆزی خودای گەورە بە مانا و لێکدانەوەی کوردی</li>
          <li>تۆمارە دەنگییە ئەسڵییەکانی بانگی کوردی (پێشەوا قادر) و دەنگی بانگبێژانی جیهانی</li>
          <li>قیبلەنمای تایبەت بە سووچی دروستی کەعبەی پیرۆز</li>
        </ul>
      </div>
    </div>
  );
};
