import React, { useState, useMemo } from 'react';
import { City, KurdishDialect } from '../types';
import { Search, MapPin, X, Compass } from 'lucide-react';

interface CityPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: City[];
  selectedCityId: number;
  onSelectCity: (city: City) => void;
  dialect: KurdishDialect;
}

export const CityPickerModal: React.FC<CityPickerModalProps> = ({
  isOpen,
  onClose,
  cities,
  selectedCityId,
  onSelectCity,
  dialect,
}) => {
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState<'all' | 'kurdistan' | 'iraq' | 'world'>('all');

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        city.nameEn.toLowerCase().includes(q) ||
        city.nameKu.includes(q) ||
        city.country.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterRegion === 'kurdistan') {
        return (
          city.countryCode === 'IQ' &&
          [
            'Erbil', 'Sulaymaniyah', 'Duhok', 'Kirkuk', 'Halabja', 'Zakho', 'Ranya',
            'Kalar', 'Chamchamal', 'Dokan', 'Darbandikhan', 'Akre', 'Koysinjaq',
            'Qaladiza', 'Bardarash', 'Qasrok', 'Makhmur', 'Penjwen', 'Khanaqin',
            'Kifri', 'Tuz Khurma', 'Sinjar', 'Al-Shikhan', 'Baneh', 'Marivan',
            'Paveh', 'Piranshahr', 'Sanandaj', 'Saqqez', 'Urmia'
          ].includes(city.nameEn)
        );
      }

      if (filterRegion === 'iraq') {
        return city.countryCode === 'IQ';
      }

      if (filterRegion === 'world') {
        return city.countryCode !== 'IQ';
      }

      return true;
    });
  }, [cities, search, filterRegion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">
                {dialect === 'badini' ? 'هەلبژارتنا باژێری' : 'هەڵبژاردنی شار'}
              </h3>
              <p className="text-xs text-slate-400">
                {dialect === 'badini'
                  ? '١٢٥ باژێر ب دەمێن ب فەرمی و پشتڕاستکری'
                  : '١٢٥ شار بە کاتەکانی فەرمی و پشتڕاستکراو'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 space-y-3 bg-slate-900/50 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={dialect === 'badini' ? 'ل باژێری بگەڕە...' : 'بگەڕێ بەدوای شاردا (هەولێر، سلێمانی، دهۆک...)'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-emerald-500 transition"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterRegion('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                filterRegion === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {dialect === 'badini' ? 'هەمی باژێر' : 'هەموو شارەکان'} ({cities.length})
            </button>
            <button
              onClick={() => setFilterRegion('kurdistan')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                filterRegion === 'kurdistan'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {dialect === 'badini' ? 'کوردستان' : 'کوردستان'}
            </button>
            <button
              onClick={() => setFilterRegion('iraq')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                filterRegion === 'iraq'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {dialect === 'badini' ? 'عێراق' : 'عێراق'}
            </button>
            <button
              onClick={() => setFilterRegion('world')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                filterRegion === 'world'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {dialect === 'badini' ? 'جیهانی' : 'نێودەوڵەتی'}
            </button>
          </div>
        </div>

        {/* City List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[50vh]">
          {filteredCities.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              {dialect === 'badini' ? 'چ باژێر نەهاتنە دیتن!' : 'هیچ شارێک نەدۆزرایەوە!'}
            </div>
          ) : (
            filteredCities.map((city) => {
              const isSelected = city.id === selectedCityId;
              return (
                <button
                  key={city.id}
                  onClick={() => {
                    onSelectCity(city);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-right transition border ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/60 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {city.countryCode}
                    </div>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <span>{city.nameKu}</span>
                        {city.nameKu !== city.nameEn && (
                          <span className="text-xs text-slate-400 font-normal">
                            ({city.nameEn})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {city.country} • قیبلە: {city.qibla}°
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Compass className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{city.qibla}°</span>
                    </div>
                    {isSelected && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                        {dialect === 'badini' ? 'هەلبژارتییە' : 'هەڵبژێردراوە'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
