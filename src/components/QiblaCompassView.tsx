import React, { useState, useEffect } from 'react';
import { City, KurdishDialect } from '../types';
import { getDistanceToKaaba } from '../utils/prayerUtils';
import {
  Compass,
  MapPin,
  Sparkles,
  RotateCw,
  Navigation,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface QiblaCompassViewProps {
  selectedCity: City;
  dialect: KurdishDialect;
  onOpenCityPicker: () => void;
}

export const QiblaCompassView: React.FC<QiblaCompassViewProps> = ({
  selectedCity,
  dialect,
  onOpenCityPicker,
}) => {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [isSensorSupported, setIsSensorSupported] = useState<boolean>(false);
  const [manualAngle, setManualAngle] = useState<number>(0);

  const qiblaBearing = selectedCity.qibla; // Target angle from North
  const distance = getDistanceToKaaba(selectedCity);

  // Device orientation event listener
  useEffect(() => {
    let sensorFound = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // In iOS webkitCompassHeading exists, in standard android alpha
      let heading = 0;
      if ((e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading !== undefined) {
        heading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
        sensorFound = true;
      } else if (e.alpha !== null) {
        heading = 360 - e.alpha;
        sensorFound = true;
      }

      if (sensorFound) {
        setIsSensorSupported(true);
        setDeviceHeading(Math.round(heading));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const effectiveHeading = isSensorSupported ? deviceHeading : manualAngle;
  // Arrow rotation towards Qibla relative to device heading
  const arrowRotation = (qiblaBearing - effectiveHeading + 360) % 360;
  const isAligned = Math.abs(arrowRotation) <= 4 || Math.abs(arrowRotation - 360) <= 4;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* City & Qibla info header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 relative overflow-hidden shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <Compass className="w-3.5 h-3.5" />
          <span>ئاراستەی ڕووی قیبلە</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          قیبلەنما بۆ شاری {selectedCity.nameKu}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-300 pt-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400">پلەی قیبلە:</span>
            <strong className="text-emerald-400 font-mono text-base">{qiblaBearing}°</strong>
            <span className="text-[11px] text-slate-500">(باشووری ڕۆژئاوا)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400">دووری لە کەعبەی پیرۆز:</span>
            <strong className="text-emerald-400 font-mono text-base">
              {distance.toLocaleString()} کم
            </strong>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onOpenCityPicker}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
          >
            گۆڕینی شار بۆ شوێنێکی تر
          </button>
        </div>
      </div>

      {/* Main Compass Stage */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 flex flex-col items-center justify-center relative shadow-2xl">
        {/* Alignment Glow Status */}
        {isAligned && (
          <div className="absolute top-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/50 shadow-lg shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ڕوو لە کەعبەی پیرۆزە (قیبلە دۆزرایەوە)!</span>
          </div>
        )}

        {/* Visual Compass Graphic Container */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-6">
          {/* Compass Dial Outer Ring */}
          <div
            className="w-full h-full transition-transform duration-150 ease-out"
            style={{
              transform: `rotate(${-effectiveHeading}deg)`,
            }}
          >
            <img
              src="/images/qibla_compass.png"
              alt="Compass Dial"
              className="w-full h-full object-contain filter drop-shadow-lg"
              onError={(e) => {
                // Fallback styled dial if image missing
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Qibla Direction Needle / Arrow */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out pointer-events-none"
            style={{
              transform: `rotate(${arrowRotation}deg)`,
            }}
          >
            <img
              src="/images/qibla_arrow.png"
              alt="Qibla Arrow"
              className="w-16 h-48 sm:w-20 sm:h-60 object-contain filter drop-shadow-md"
              onError={(e) => {
                // Fallback SVG arrow if image missing
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Central Pivot Jewel */}
          <div className="absolute w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Manual Heading Slider for Desktop / Manual adjustment */}
        <div className="w-full max-w-sm space-y-2 mt-4 text-center">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {isSensorSupported
                ? 'سێنسەری مۆبایل کارایە'
                : 'سوڕاندنی دەستی قیبلەنما:'}
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {effectiveHeading}° (سووچ)
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="359"
            value={effectiveHeading}
            onChange={(e) => {
              setIsSensorSupported(false);
              setManualAngle(Number(e.target.value));
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0° (باکوور)</span>
            <span>90° (ڕۆژهەڵات)</span>
            <span>180° (باشوور)</span>
            <span>270° (ڕۆژئاوا)</span>
          </div>
        </div>
      </div>

      {/* Direction Guide Note */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
        <div className="font-bold text-slate-200 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>ڕێنمایی دیاریکردنی قیبلە لە شارەکانی کوردستان:</span>
        </div>
        <p>
          قیبلە لە تەواوی هەرێمی کوردستان و عێراق دەکەوێتە ئاراستەی{' '}
          <strong className="text-emerald-300">باشووری ڕۆژئاوا (South-West)</strong>{' '}
          بە سووچی نزیکەی <strong className="text-emerald-300">١٩٨° بۆ ٢٠٥°</strong>.
          لە مۆبایلەکەتدا دەتوانیت ئامێرەکە ڕێک لەسەر ڕوویەکی تەخت دابنێیت تاکو سێنسەرەکە
          تەواو بە ئاراستەی تیشکی سەوزی کەعبە هاوتەریب ببێت.
        </p>
      </div>
    </div>
  );
};
