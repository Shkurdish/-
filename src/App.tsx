import React, { useState, useEffect, useRef } from 'react';
import { City, KurdishDialect, AppSettings, AzkarCategory, AllahName } from './types';
import { DEFAULT_ERBIL_PRAYERS } from './data/default_erbil';
import { AUDIO_TRACKS } from './data/audioList';
import { Header, NavTab } from './components/Header';
import { PrayerTimesView } from './components/PrayerTimesView';
import { AzkarView } from './components/AzkarView';
import { Names99View } from './components/Names99View';
import { QiblaCompassView } from './components/QiblaCompassView';
import { TasbihView } from './components/TasbihView';
import { AudioPlayerView } from './components/AudioPlayerView';
import { SettingsView } from './components/SettingsView';
import { CityPickerModal } from './components/CityPickerModal';

// Default Erbil City Object
const DEFAULT_CITY: City = {
  id: 77359,
  nameEn: 'Erbil',
  nameKu: 'هەولێر',
  country: 'Iraq',
  countryCode: 'IQ',
  lat: 36.191113,
  lon: 44.009167,
  qibla: 198.8,
};

const DEFAULT_SETTINGS: AppSettings = {
  dialect: 'ckb',
  selectedCityId: 77359,
  timeFormat24: false,
  selectedAdhanId: 'peshawa',
  prayerAdjustments: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
  hijriAdjustment: 0,
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('prayers');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [cities, setCities] = useState<City[]>([DEFAULT_CITY]);
  const [selectedCity, setSelectedCity] = useState<City>(DEFAULT_CITY);
  const [isCityPickerOpen, setIsCityPickerOpen] = useState<boolean>(false);

  // Prayer times dataset
  const [allPrayerTimes, setAllPrayerTimes] = useState<Record<string, Record<string, [string, string, string, string, string, string]>>>({
    '77359': DEFAULT_ERBIL_PRAYERS,
  });

  // Azkar and Names datasets
  const [azkarCategories, setAzkarCategories] = useState<AzkarCategory[]>([]);
  const [allahNames, setAllahNames] = useState<AllahName[]>([]);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('myprayers_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Audio Playback
  const [activeAudioTrackId, setActiveAudioTrackId] = useState<string | null>(null);
  const audioGlobalRef = useRef<HTMLAudioElement | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save settings on change
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('myprayers_settings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Toggle Dialect
  const handleToggleDialect = () => {
    handleUpdateSettings({ dialect: settings.dialect === 'ckb' ? 'badini' : 'ckb' });
  };

  // Load cities, azkar, names, and prayer times
  useEffect(() => {
    // 1. Fetch cities
    fetch('/data/cities.json')
      .then((res) => res.json())
      .then((data: City[]) => {
        setCities(data);
        // If saved city exists in list, restore it
        const savedCityId = settings.selectedCityId;
        const matched = data.find((c) => c.id === savedCityId);
        if (matched) {
          setSelectedCity(matched);
        }
      })
      .catch(() => {});

    // 2. Fetch full prayer times
    fetch('/data/prayer_times.json')
      .then((res) => res.json())
      .then((data) => {
        setAllPrayerTimes(data);
      })
      .catch(() => {});

    // 3. Fetch azkar
    fetch('/data/azkar.json')
      .then((res) => res.json())
      .then((data) => {
        setAzkarCategories(data);
      })
      .catch(() => {});

    // 4. Fetch 99 names
    fetch('/data/names99.json')
      .then((res) => res.json())
      .then((data) => {
        setAllahNames(data);
      })
      .catch(() => {});
  }, []);

  // Handle city selection
  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    handleUpdateSettings({ selectedCityId: city.id });
  };

  // Global Audio Playback (e.g. from Hero Card button)
  const handlePlayAdhan = (trackId?: string) => {
    const targetId = trackId || settings.selectedAdhanId || 'peshawa';
    if (activeAudioTrackId === targetId) {
      // Toggle pause
      if (audioGlobalRef.current) {
        audioGlobalRef.current.pause();
      }
      setActiveAudioTrackId(null);
    } else {
      const track = AUDIO_TRACKS.find((t) => t.id === targetId) || AUDIO_TRACKS[0];
      if (audioGlobalRef.current) {
        audioGlobalRef.current.src = track.src;
        audioGlobalRef.current.play().catch(() => {});
      }
      setActiveAudioTrackId(targetId);
    }
  };

  const handleStopAudio = () => {
    if (audioGlobalRef.current) {
      audioGlobalRef.current.pause();
    }
    setActiveAudioTrackId(null);
  };

  // Current city prayer times map: e.g. "09-21" -> [fajr, sunrise, dhuhr, asr, maghrib, isha]
  const currentCityPrayers = allPrayerTimes[String(selectedCity.id)] || allPrayerTimes['77359'] || DEFAULT_ERBIL_PRAYERS;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200" dir="rtl">
      {/* Hidden global audio element for Adhan */}
      <audio
        ref={audioGlobalRef}
        onEnded={() => setActiveAudioTrackId(null)}
        onError={() => setActiveAudioTrackId(null)}
      />

      {/* Header with Navigation and City button */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedCity={selectedCity}
        onOpenCityPicker={() => setIsCityPickerOpen(true)}
        dialect={settings.dialect}
        onToggleDialect={handleToggleDialect}
        isPlayingAudio={activeAudioTrackId !== null}
        onStopAudio={handleStopAudio}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'prayers' && (
          <PrayerTimesView
            selectedCity={selectedCity}
            allCities={cities}
            onSelectCity={handleSelectCity}
            onOpenCityPicker={() => setIsCityPickerOpen(true)}
            prayerTimesForCity={currentCityPrayers}
            dialect={settings.dialect}
            settings={settings}
            currentTime={currentTime}
            onPlayAdhan={handlePlayAdhan}
            isPlayingAdhan={activeAudioTrackId !== null}
          />
        )}

        {currentTab === 'azkar' && (
          <AzkarView
            categories={azkarCategories}
            dialect={settings.dialect}
          />
        )}

        {currentTab === 'names' && (
          <Names99View
            names={allahNames}
            dialect={settings.dialect}
          />
        )}

        {currentTab === 'qibla' && (
          <QiblaCompassView
            selectedCity={selectedCity}
            dialect={settings.dialect}
            onOpenCityPicker={() => setIsCityPickerOpen(true)}
          />
        )}

        {currentTab === 'tasbih' && (
          <TasbihView
            dialect={settings.dialect}
          />
        )}

        {currentTab === 'audio' && (
          <AudioPlayerView
            dialect={settings.dialect}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            activeTrackId={activeAudioTrackId}
            onTrackChange={setActiveAudioTrackId}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            dialect={settings.dialect}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-kurdish text-slate-400">
            بەرنامەی نوێژەکانم • کاتەکانی بانگ، ئەزکارەکان، قیبلەنما و ناوی خودا بە داتای فەرمی
          </p>
          <p className="text-[11px] text-slate-600">
            Powered by MuslimData DB v2.5.1 • بۆ هەموو موسڵمانانی کوردستان و جیهان
          </p>
        </div>
      </footer>

      {/* City Picker Modal */}
      <CityPickerModal
        isOpen={isCityPickerOpen}
        onClose={() => setIsCityPickerOpen(false)}
        cities={cities}
        selectedCityId={selectedCity.id}
        onSelectCity={handleSelectCity}
        dialect={settings.dialect}
      />
    </div>
  );
}
