import React from 'react';
import { City, KurdishDialect } from '../types';
import {
  Clock,
  BookOpen,
  Sparkles,
  Compass,
  Repeat,
  Volume2,
  Settings,
  MapPin,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { getHijriDate } from '../utils/prayerUtils';

export type NavTab = 'prayers' | 'azkar' | 'names' | 'qibla' | 'tasbih' | 'audio' | 'settings';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedCity: City;
  onOpenCityPicker: () => void;
  dialect: KurdishDialect;
  onToggleDialect: () => void;
  isPlayingAudio: boolean;
  onStopAudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  selectedCity,
  onOpenCityPicker,
  dialect,
  onToggleDialect,
  isPlayingAudio,
  onStopAudio,
}) => {
  const hijri = getHijriDate();
  const today = new Date();
  const kurdishMonths = [
    'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
    'تەمموز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'
  ];
  const gregorianStr = `${today.getDate()}ی ${kurdishMonths[today.getMonth()]}ی ${today.getFullYear()}`;

  const tabs: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }> }> = [
    {
      id: 'prayers',
      label: dialect === 'badini' ? 'دەمێن نڤێژێ' : 'کاتەکانی نوێژ',
      icon: Clock,
    },
    {
      id: 'azkar',
      label: dialect === 'badini' ? 'ئەزکار و وێرد' : 'ئەزکار و ویردەکان',
      icon: BookOpen,
    },
    {
      id: 'names',
      label: dialect === 'badini' ? '٩٩ ناڤێن خودێ' : '٩٩ ناوی خودا',
      icon: Sparkles,
    },
    {
      id: 'qibla',
      label: dialect === 'badini' ? 'قیبلەنما' : 'قیبلەنما',
      icon: Compass,
    },
    {
      id: 'tasbih',
      label: dialect === 'badini' ? 'تەسبیح' : 'تەسبیح',
      icon: Repeat,
    },
    {
      id: 'audio',
      label: dialect === 'badini' ? 'دەنگێ بانگێ' : 'دەنگی بانگبێژان',
      icon: Volume2,
    },
    {
      id: 'settings',
      label: dialect === 'badini' ? 'ڕێکخستن' : 'ڕێکخستنەکان',
      icon: Settings,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar with branding, date, and city */}
        <div className="flex items-center justify-between py-3.5 border-b border-slate-800/60">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <Moon className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-slate-100 tracking-tight">
                  نوێژەکانم
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  My Prayers
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {dialect === 'badini'
                  ? 'بەرنامەیا فەرمی یا دەمێن نڤێژێ و ئەزکاران'
                  : 'بەرنامەی فەرمی بۆ کاتەکانی نوێژ و ئەزکار لە کوردستان'}
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio playing banner indicator */}
            {isPlayingAudio && (
              <button
                onClick={onStopAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium animate-pulse transition hover:bg-amber-500/25"
                title="وەستاندنی دەنگ"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">دەنگ لێدەدرێت</span>
              </button>
            )}

            {/* City selector pill */}
            <button
              onClick={onOpenCityPicker}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 rounded-xl text-xs sm:text-sm text-slate-200 transition shadow-inner hover:bg-slate-850"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-emerald-300">{selectedCity.nameKu}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Hijri date badge */}
            <div className="hidden lg:flex flex-col text-left text-xs bg-slate-900/60 px-3 py-1 rounded-xl border border-slate-800">
              <span className="font-semibold text-emerald-400">
                {hijri.day} {hijri.monthNameKu} {hijri.year} کـ
              </span>
              <span className="text-[11px] text-slate-400">{gregorianStr}</span>
            </div>

            {/* Dialect toggle button */}
            <button
              onClick={onToggleDialect}
              className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-medium transition"
              title="گۆڕینی شێوەزار"
            >
              {dialect === 'ckb' ? 'سۆرانی' : 'بادینی'}
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
