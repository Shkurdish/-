import React, { useState, useMemo } from 'react';
import { AzkarCategory, AzkarChapter, AzkarItem, KurdishDialect } from '../types';
import {
  Search,
  BookOpen,
  Bookmark,
  Share2,
  Check,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Layers,
  Heart,
} from 'lucide-react';

interface AzkarViewProps {
  categories: AzkarCategory[];
  dialect: KurdishDialect;
}

export const AzkarView: React.FC<AzkarViewProps> = ({ categories, dialect }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1); // Default to morning/evening
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [counters, setCounters] = useState<Record<number, number>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('azkar_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Toggle favorite
  const toggleFavorite = (itemId: number) => {
    const updated = favorites.includes(itemId)
      ? favorites.filter((id) => id !== itemId)
      : [...favorites, itemId];
    setFavorites(updated);
    try {
      localStorage.setItem('azkar_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Increment counter for specific azkar item
  const handleCount = (item: AzkarItem) => {
    const current = counters[item.id] || 0;
    const max = item.count || 1;
    if (current < max) {
      setCounters((prev) => ({ ...prev, [item.id]: current + 1 }));
    }
  };

  // Reset counter
  const handleResetCount = (itemId: number) => {
    setCounters((prev) => ({ ...prev, [itemId]: 0 }));
  };

  // Copy azkar text
  const handleCopy = (item: AzkarItem) => {
    const trans = dialect === 'badini' && item.translationBadini ? item.translationBadini : item.translationCkb;
    const text = `${item.item}\n\nواتا: ${trans}\n\nسەرچاوە: ${item.reference}\n\n(لە بەرنامەی نوێژەکانمەوە)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered azkar items based on search or category
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // If searching across all azkar
    if (query) {
      const matchedItems: Array<{ item: AzkarItem; chapterName: string; categoryName: string }> = [];
      for (const cat of categories) {
        const catName = dialect === 'badini' && cat.nameBadini ? cat.nameBadini : cat.nameCkb;
        for (const ch of cat.chapters) {
          const chName = dialect === 'badini' && ch.nameBadini ? ch.nameBadini : ch.nameCkb;
          for (const it of ch.items) {
            const trans = dialect === 'badini' && it.translationBadini ? it.translationBadini : it.translationCkb;
            if (
              it.item.includes(query) ||
              trans.toLowerCase().includes(query) ||
              chName.toLowerCase().includes(query) ||
              it.reference.toLowerCase().includes(query)
            ) {
              matchedItems.push({
                item: it,
                chapterName: chName,
                categoryName: catName,
              });
            }
          }
        }
      }
      return { isSearch: true, results: matchedItems };
    }

    // Active Category
    const currentCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];
    return { isSearch: false, currentCategory };
  }, [categories, selectedCategoryId, searchQuery, dialect]);

  // Selected Chapter items if not search
  const currentChapter = useMemo(() => {
    if (filteredData.isSearch || !filteredData.currentCategory) return null;
    const chapters = filteredData.currentCategory.chapters;
    if (selectedChapterId) {
      return chapters.find((ch) => ch.id === selectedChapterId) || chapters[0];
    }
    return chapters[0] || null;
  }, [filteredData, selectedChapterId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search & Favorites Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              dialect === 'badini'
                ? 'ل ئەزکار و نڤێژ و ویردان بگەڕە (عەرەبی یان کوردی)...'
                : 'بگەڕێ بەناو هەموو ئەزکار، نزا و ویردەکاندا (کوردی یان عەرەبی)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-emerald-500 transition shadow-inner"
          />
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition border shrink-0 ${
            showFavoritesOnly
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
          }`}
        >
          <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-rose-400 text-rose-400' : 'text-slate-400'}`} />
          <span>{dialect === 'badini' ? 'دلخوازێن من' : 'دڵخوازەکانم'} ({favorites.length})</span>
        </button>
      </div>

      {/* Category Pills Slider (When not searching) */}
      {!searchQuery && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = cat.id === selectedCategoryId;
              const catName = dialect === 'badini' && cat.nameBadini ? cat.nameBadini : cat.nameCkb;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setSelectedChapterId(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-slate-100'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          {/* Chapters Sub-selector inside category */}
          {filteredData.currentCategory && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 shrink-0 flex items-center gap-1 font-semibold">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                {dialect === 'badini' ? 'بابەت:' : 'بەشەکان:'}
              </span>
              {filteredData.currentCategory.chapters.map((ch) => {
                const isChSelected = currentChapter?.id === ch.id;
                const chName = dialect === 'badini' && ch.nameBadini ? ch.nameBadini : ch.nameCkb;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChapterId(ch.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                      isChSelected
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'bg-slate-850/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {chName} ({ch.items.length})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Azkar Items List */}
      <div className="space-y-4">
        {filteredData.isSearch ? (
          // Search Results
          filteredData.results && filteredData.results.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              هیچ ئەزکارێک نەدۆزرایەوە بۆ گەڕانەکەت!
            </div>
          ) : (
            filteredData.results?.map(({ item, chapterName, categoryName }) => {
              if (showFavoritesOnly && !favorites.includes(item.id)) return null;
              return (
                <AzkarCard
                  key={item.id}
                  item={item}
                  chapterName={chapterName}
                  categoryName={categoryName}
                  dialect={dialect}
                  counter={counters[item.id] || 0}
                  onCount={() => handleCount(item)}
                  onReset={() => handleResetCount(item.id)}
                  onCopy={() => handleCopy(item)}
                  isCopied={copiedId === item.id}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              );
            })
          )
        ) : (
          // Category & Chapter Items
          currentChapter?.items.map((item) => {
            if (showFavoritesOnly && !favorites.includes(item.id)) return null;
            const chName = dialect === 'badini' && currentChapter.nameBadini ? currentChapter.nameBadini : currentChapter.nameCkb;
            const catName = dialect === 'badini' && filteredData.currentCategory?.nameBadini ? filteredData.currentCategory.nameBadini : filteredData.currentCategory?.nameCkb;
            return (
              <AzkarCard
                key={item.id}
                item={item}
                chapterName={chName}
                categoryName={catName}
                dialect={dialect}
                counter={counters[item.id] || 0}
                onCount={() => handleCount(item)}
                onReset={() => handleResetCount(item.id)}
                onCopy={() => handleCopy(item)}
                isCopied={copiedId === item.id}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

// Azkar Card Component
interface AzkarCardProps {
  item: AzkarItem;
  chapterName?: string;
  categoryName?: string;
  dialect: KurdishDialect;
  counter: number;
  onCount: () => void;
  onReset: () => void;
  onCopy: () => void;
  isCopied: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const AzkarCard: React.FC<AzkarCardProps> = ({
  item,
  chapterName,
  categoryName,
  dialect,
  counter,
  onCount,
  onReset,
  onCopy,
  isCopied,
  isFavorite,
  onToggleFavorite,
}) => {
  const maxCount = item.count || 1;
  const isCompleted = counter >= maxCount;
  const translation =
    dialect === 'badini' && item.translationBadini ? item.translationBadini : item.translationCkb;

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between gap-5 ${
        isCompleted
          ? 'bg-slate-900/60 border-emerald-500/40 shadow-md shadow-emerald-500/5'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header with Chapter Tag, Count Badge, and Favorite/Share */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 text-xs">
          {categoryName && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold">
              {categoryName}
            </span>
          )}
          {chapterName && (
            <span className="text-slate-400 font-medium">
              • {chapterName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-xl border transition ${
              isFavorite
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:text-rose-400'
            }`}
            title="دڵخوازکردن"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Copy Button */}
          <button
            onClick={onCopy}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-750 text-slate-400 hover:text-slate-200 transition"
            title="کۆپیکردن"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Arabic Text */}
      <div className="space-y-4">
        <div
          className="font-quran text-xl sm:text-2xl leading-loose text-slate-100 font-medium select-text tracking-normal text-right dir-rtl"
        >
          {item.item}
        </div>

        {/* Kurdish Translation */}
        {translation && (
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-sm leading-relaxed text-slate-300 font-kurdish">
            <span className="text-xs font-semibold text-emerald-400 block mb-1">
              {dialect === 'badini' ? 'واتا (بادینی):' : 'مانا (سۆرانی):'}
            </span>
            {translation}
          </div>
        )}

        {/* Hadith Reference */}
        {item.reference && (
          <div className="text-xs text-slate-500 font-arabic leading-normal">
            سەرچاوە: {item.reference}
          </div>
        )}
      </div>

      {/* Footer Interactive Counter */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          {/* Main Tap Counter Button */}
          <button
            onClick={onCount}
            disabled={isCompleted}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition shadow-sm ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>تەواوکرا ({maxCount} جار)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  بخوێنە ({counter} / {maxCount})
                </span>
              </>
            )}
          </button>

          {/* Reset button if clicked */}
          {counter > 0 && (
            <button
              onClick={onReset}
              className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="دوبارە دەستپێکردنەوە"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Progress pills indicator */}
        <div className="text-xs text-slate-400 font-mono">
          {maxCount > 1 && (
            <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              ماوە: {Math.max(0, maxCount - counter)} جار
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
