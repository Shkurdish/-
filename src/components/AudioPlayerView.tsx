import React, { useState, useRef, useEffect } from 'react';
import { AudioTrack, KurdishDialect, AppSettings } from '../types';
import { AUDIO_TRACKS } from '../data/audioList';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Check,
  Music,
  ListMusic,
} from 'lucide-react';

interface AudioPlayerViewProps {
  dialect: KurdishDialect;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  activeTrackId: string | null;
  onTrackChange: (trackId: string | null) => void;
}

export const AudioPlayerView: React.FC<AudioPlayerViewProps> = ({
  dialect,
  settings,
  onUpdateSettings,
  activeTrackId,
  onTrackChange,
}) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(() => {
    return AUDIO_TRACKS.find((t) => t.id === settings.selectedAdhanId) || AUDIO_TRACKS[0];
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [filterTag, setFilterTag] = useState<'all' | 'adhan' | 'fajr_adhan' | 'recitation' | 'nasheed'>('all');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync with global active track if triggered from other screens
  useEffect(() => {
    if (activeTrackId) {
      const found = AUDIO_TRACKS.find((t) => t.id === activeTrackId);
      if (found && found.id !== currentTrack.id) {
        setCurrentTrack(found);
        setIsPlaying(true);
      }
    }
  }, [activeTrackId]);

  // Audio play/pause effect
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
      onTrackChange(currentTrack.id);
    } else {
      audioRef.current.pause();
      if (activeTrackId === currentTrack.id) {
        onTrackChange(null);
      }
    }
  }, [isPlaying, currentTrack]);

  const handleSelectTrack = (track: AudioTrack) => {
    if (currentTrack.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleSetDefaultAdhan = (trackId: string) => {
    onUpdateSettings({ selectedAdhanId: trackId });
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const filteredTracks = AUDIO_TRACKS.filter((t) => {
    if (filterTag === 'all') return true;
    return t.tag === filterTag;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          onTrackChange(null);
        }}
      />

      {/* Main Active Player Deck */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-right">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0">
              <Music className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold mb-1">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>دەنگبێژ و قورئانخوێن</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                {currentTrack.titleKu}
              </h3>
              <p className="text-xs text-slate-400 font-arabic mt-0.5">
                {currentTrack.titleAr}
              </p>
            </div>
          </div>

          {/* Set as Default Adhan Button */}
          {currentTrack.tag.includes('adhan') && (
            <button
              onClick={() => handleSetDefaultAdhan(currentTrack.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border shrink-0 ${
                settings.selectedAdhanId === currentTrack.id
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {settings.selectedAdhanId === currentTrack.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>بانگی سەرەکی دیاریکراوە</span>
                </>
              ) : (
                <span>دانان وەک بانگی سەرەکی</span>
              )}
            </button>
          )}
        </div>

        {/* Timeline Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCurrentTime(val);
              if (audioRef.current) audioRef.current.currentTime = val;
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls: Play/Pause and Volume */}
        <div className="flex items-center justify-between pt-2">
          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextVol = volume > 0 ? 0 : 0.85;
                setVolume(nextVol);
                if (audioRef.current) audioRef.current.volume = nextVol;
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const val = Number(e.target.value);
                setVolume(val);
                if (audioRef.current) audioRef.current.volume = val;
              }}
              className="w-20 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none accent-emerald-500"
            />
          </div>

          {/* Main Big Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/25 transition active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current pr-0.5" />
            )}
          </button>

          <div className="w-24 sm:w-32" />
        </div>
      </div>

      {/* Filter Tabs for Track List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterTag('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            filterTag === 'all'
              ? 'bg-emerald-600 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850'
          }`}
        >
          هەموو تۆمارەکان ({AUDIO_TRACKS.length})
        </button>
        <button
          onClick={() => setFilterTag('adhan')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            filterTag === 'adhan'
              ? 'bg-emerald-600 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850'
          }`}
        >
          دەنگی بانگ
        </button>
        <button
          onClick={() => setFilterTag('fajr_adhan')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            filterTag === 'fajr_adhan'
              ? 'bg-emerald-600 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850'
          }`}
        >
          بانگی بەیانیان
        </button>
        <button
          onClick={() => setFilterTag('recitation')}
          className={`px-3 py-1.5 rounded-xl font-medium transition ${
            filterTag === 'recitation'
              ? 'bg-emerald-600 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850'
          }`}
        >
          ئیبتیهال و ناوی خودا
        </button>
      </div>

      {/* Tracks List */}
      <div className="space-y-2">
        {filteredTracks.map((track) => {
          const isCurrent = currentTrack.id === track.id;
          const isDefault = settings.selectedAdhanId === track.id;

          return (
            <div
              key={track.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                isCurrent
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-750 hover:bg-slate-850/60 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSelectTrack(track)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0 ${
                    isCurrent && isPlaying
                      ? 'bg-emerald-500 text-slate-950 animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>

                <div className="text-right">
                  <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                    <span>{track.titleKu}</span>
                    {isDefault && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-semibold">
                        بانگی سەرەکی
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {track.titleAr}
                  </div>
                </div>
              </div>

              {/* Set as Default button */}
              {track.tag.includes('adhan') && !isDefault && (
                <button
                  onClick={() => handleSetDefaultAdhan(track.id)}
                  className="text-xs text-slate-400 hover:text-emerald-300 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 transition shrink-0"
                >
                  دانان وەک بانگ
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
