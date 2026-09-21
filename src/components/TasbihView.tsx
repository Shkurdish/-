import React, { useState, useEffect } from 'react';
import { KurdishDialect } from '../types';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  Sparkles,
  CheckCircle2,
  Plus,
  Flame,
} from 'lucide-react';

interface TasbihViewProps {
  dialect: KurdishDialect;
}

const PRESET_DHIKRS = [
  { ar: 'سُبْحَانَ اللَّهِ', ku: 'پاک و بێگەردی بۆ خودایە', target: 33 },
  { ar: 'الْحَمْدُ لِلَّهِ', ku: 'سوپاس و ستایش بۆ خودایە', target: 33 },
  { ar: 'لَا إِلَهَ إِلَّا اللَّهُ', ku: 'هیچ پەرستراوێک نییە جگە لە خودا', target: 33 },
  { ar: 'اللَّهُ أَكْبَرُ', ku: 'خودا گەورەترینە', target: 33 },
  { ar: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', ku: 'داوای لێخۆشبوون لە خودا دەکەم', target: 100 },
  { ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', ku: 'هیچ هێز و دەسەڵاتێک نییە جگە لە خودا', target: 100 },
  { ar: 'اللَّهُمَّ صَلِّ عَلَى مُحەمَّدٍ وَعَلَى آلِ مُحَمَّدٍ', ku: 'سڵاواتی پێغەمبەر (ﷺ)', target: 100 },
  { ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ', ku: 'سوپاس و پاکی بۆ خودای مەزن', target: 100 },
];

export const TasbihView: React.FC<TasbihViewProps> = ({ dialect }) => {
  const [selectedDhikrIndex, setSelectedDhikrIndex] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [laps, setLaps] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [totalCount, setTotalCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('tasbih_total') || 0);
    } catch {
      return 0;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [isPressing, setIsPressing] = useState<boolean>(false);

  const currentDhikr = PRESET_DHIKRS[selectedDhikrIndex];

  // Synthesize pleasant wooden bead click using Web Audio API
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // AudioContext may be blocked before interaction
    }
  };

  const handleTap = () => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 120);

    // Vibration on mobile
    if (vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(20);
    }

    playClickSound();

    const nextCount = count + 1;
    const nextTotal = totalCount + 1;

    setTotalCount(nextTotal);
    try {
      localStorage.setItem('tasbih_total', String(nextTotal));
    } catch {
      // ignore
    }

    if (target > 0 && nextCount >= target) {
      setCount(0);
      setLaps((l) => l + 1);
      // Completion vibrate
      if (vibrateEnabled && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
    } else {
      setCount(nextCount);
    }
  };

  const handleReset = () => {
    setCount(0);
    setLaps(0);
  };

  const handleResetTotal = () => {
    if (window.confirm('ئایا دڵنیایت لە سفرکردنەوەی کۆی گشتی زیکرەکانت؟')) {
      setTotalCount(0);
      try {
        localStorage.removeItem('tasbih_total');
      } catch {
        // ignore
      }
    }
  };

  // Progress percentage
  const progressPercent = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Presets */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {dialect === 'badini' ? 'هەلبژارتنا زکری:' : 'هەڵبژاردنی زیکر:'}
          </span>

          {/* Sound & Vibrate Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs transition ${
                soundEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title="دەنگی کلیک"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setVibrateEnabled(!vibrateEnabled)}
              className={`p-2 rounded-xl border text-xs transition ${
                vibrateEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title="لەرزین (ڤایبرەیشن)"
            >
              <Vibrate className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preset chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_DHIKRS.map((item, idx) => {
            const isSelected = selectedDhikrIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDhikrIndex(idx);
                  setTarget(item.target);
                  setCount(0);
                  setLaps(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-arabic whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/30'
                    : 'bg-slate-800/80 border-slate-750 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {item.ar}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tasbih Counter Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
        {/* Active Dhikr Display */}
        <div className="text-center space-y-1 mb-8 max-w-md">
          <h2 className="font-quran text-2xl sm:text-3xl font-bold text-slate-100">
            {currentDhikr.ar}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-kurdish">
            {currentDhikr.ku}
          </p>
        </div>

        {/* Giant Interactive Bead / Tap Button */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Progress ring svg */}
          <svg className="w-64 h-64 sm:w-72 sm:h-72 -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="text-slate-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            {target > 0 && (
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                className="text-emerald-500 transition-all duration-150"
                strokeWidth="6"
                strokeDasharray="100 100"
                strokeDashoffset={100 - progressPercent}
                pathLength="100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            )}
          </svg>

          {/* Central Button */}
          <button
            onClick={handleTap}
            className={`absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-100 border-4 ${
              isPressing
                ? 'scale-95 bg-emerald-700 border-emerald-400 shadow-inner'
                : 'scale-100 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 border-emerald-400/60 shadow-xl shadow-emerald-500/25 active:scale-95'
            }`}
          >
            <span className="text-5xl sm:text-6xl font-mono font-extrabold text-white tracking-wider drop-shadow-md">
              {count}
            </span>
            <span className="text-xs font-semibold text-emerald-100 mt-1 uppercase tracking-wider">
              {target > 0 ? `ئامانج: ${target}` : 'بێ سنوور'}
            </span>
            <span className="text-[11px] text-emerald-200/80 mt-1">
              کلیک بکە بۆ ژماردن
            </span>
          </button>
        </div>

        {/* Target limit selectors & Laps */}
        <div className="w-full max-w-sm flex items-center justify-between mt-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">سوڕ (خول):</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-mono font-bold">
              {laps}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 pl-1">ئامانج:</span>
            {[33, 99, 100, 0].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTarget(t);
                  setCount(0);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono transition ${
                  target === t
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
              >
                {t === 0 ? '∞' : t}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            title="سفرکردنەوە"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Total All-Time Dhikr Counter */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400">
              {dialect === 'badini' ? 'کۆیا گشتی یا زکران:' : 'کۆی گشتی هەموو زیکرەکانت:'}
            </span>
            <div className="font-mono text-lg font-bold text-emerald-400">
              {totalCount.toLocaleString()} زیکر
            </div>
          </div>
        </div>

        {totalCount > 0 && (
          <button
            onClick={handleResetTotal}
            className="text-xs text-slate-500 hover:text-rose-400 transition"
          >
            سفرکردنەوە
          </button>
        )}
      </div>
    </div>
  );
};
