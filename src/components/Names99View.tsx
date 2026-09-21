import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AllahName, KurdishDialect } from '../types';
import {
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
} from 'lucide-react';

interface Names99ViewProps {
  names: AllahName[];
  dialect: KurdishDialect;
}

export const Names99View: React.FC<Names99ViewProps> = ({ names, dialect }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedName, setSelectedName] = useState<AllahName | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filtered names
  const filteredNames = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return names;
    return names.filter((n) => {
      return (
        n.id.toString() === q ||
        n.arabic.includes(q) ||
        n.ckb.toLowerCase().includes(q) ||
        n.badini.toLowerCase().includes(q) ||
        n.en.toLowerCase().includes(q)
      );
    });
  }, [names, search]);

  // Audio play/pause
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Audio element for names99.mp3 */}
      <audio
        ref={audioRef}
        src="/audio/names99.mp3"
        onEnded={() => setIsPlayingAudio(false)}
        preload="metadata"
      />

      {/* Hero Header with Recitation Play Button */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>أسماء الله الحسنى</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {dialect === 'badini' ? '٩٩ ناڤێن پیرۆزێن خودێ مەزن' : '٩٩ ناوی پیرۆزی خودای گەورە'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            {dialect === 'badini'
              ? 'پێغەمبەر (سڵاڤ لێ بن) دبێژیت: خودێ نەوت و نەهـ ناڤ یێن هەین، هەر کەسێ ژبەر بکەت دێ چیتە بەهەشتێ'
              : 'پێغەمبەری خودا (ﷺ) دەفەرموێت: بەڕاستی بۆ خودای گەورە نەوەت و نۆ ناو هەیە، هەرکەسێک لەبەریان بکات دەچێتە بەهەشتەوە'}
          </p>
        </div>

        {/* Audio Player Trigger */}
        <button
          onClick={togglePlayAudio}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm transition shadow-lg shrink-0 ${
            isPlayingAudio
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/30 animate-pulse'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>ڕاگرتنی خوێندنەوەی ناوەکان</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>گوێگرتن لە خوێندنەوەی ٩٩ ناوەکە</span>
            </>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={
            dialect === 'badini'
              ? 'ل ناڤان دا بگەڕە (نموونە: الرحمن، ١، بەخشندە)...'
              : 'بگەڕێ بەدوای ناودا (نموونە: الرحمن، یان ژمارە 1، یان ماناکەی)...'
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-emerald-500 transition shadow-inner"
        />
      </div>

      {/* 99 Names Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {filteredNames.map((name) => {
          const meaning =
            dialect === 'badini' && name.badini ? name.badini : name.ckb;

          return (
            <button
              key={name.id}
              onClick={() => setSelectedName(name)}
              className="relative p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850/80 transition-all duration-150 flex flex-col justify-between text-right group"
            >
              {/* Top Badge: Number and Info */}
              <div className="flex items-center justify-between w-full mb-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 text-xs font-mono font-bold flex items-center justify-center transition">
                  {name.id}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">{name.en}</span>
              </div>

              {/* Arabic Name */}
              <div className="my-2">
                <div className="font-quran text-2xl font-bold text-slate-100 group-hover:text-emerald-300 transition">
                  {name.arabic}
                </div>
              </div>

              {/* Truncated Kurdish Meaning */}
              <div className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {meaning}
              </div>
            </button>
          );
        })}
      </div>

      {/* Name Details Modal */}
      {selectedName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-right relative overflow-hidden"
            dir="rtl"
          >
            {/* Top Close */}
            <button
              onClick={() => setSelectedName(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title & Badge */}
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-mono font-bold">
                ناوی ژمارە #{selectedName.id}
              </span>
              <h3 className="font-quran text-4xl sm:text-5xl font-bold text-emerald-400 py-2">
                {selectedName.arabic}
              </h3>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                {selectedName.en}
              </p>
            </div>

            {/* Detailed Explanation */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-emerald-400 block">
                {dialect === 'badini' ? 'شڕۆڤە و واتا (بادینی):' : 'مانا و لێکدانەوە بە کوردی:'}
              </span>
              <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-kurdish">
                {dialect === 'badini' && selectedName.badini
                  ? selectedName.badini
                  : selectedName.ckb}
              </p>

              {dialect === 'badini' && selectedName.ckb && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-xs text-slate-500 block mb-1">بە شێوەزاری سۆرانی:</span>
                  <p className="text-xs text-slate-400 leading-normal">{selectedName.ckb}</p>
                </div>
              )}
            </div>

            {/* Navigation buttons between names */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={selectedName.id <= 1}
                onClick={() => {
                  const prev = names.find((n) => n.id === selectedName.id - 1);
                  if (prev) setSelectedName(prev);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-semibold transition"
              >
                <ChevronRight className="w-4 h-4" />
                <span>ناوی پێشوو</span>
              </button>

              <button
                onClick={() => {
                  const text = `ناوی پیرۆزی خودا: ${selectedName.arabic}\nواتا: ${selectedName.ckb}\nلە بەرنامەی نوێژەکانم 🌙`;
                  navigator.clipboard.writeText(text);
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition"
                title="کۆپیکردن"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                disabled={selectedName.id >= 99}
                onClick={() => {
                  const next = names.find((n) => n.id === selectedName.id + 1);
                  if (next) setSelectedName(next);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-semibold transition"
              >
                <span>ناوی دواتر</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
