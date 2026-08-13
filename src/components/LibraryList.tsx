import React from 'react';
import { Library, UserLocation } from '../types';
import { calculateDistance, formatDistance, getOpenStatus } from '../utils/geo';
import { Wifi, Laptop, Car, Baby, Bookmark, Navigation, BookOpen, ExternalLink, Clock, MapPin, ChevronRight, Sparkles } from 'lucide-react';

interface LibraryListProps {
  libraries: Library[];
  selectedLibrary: Library | null;
  onSelectLibrary: (library: Library) => void;
  onOpenDetails: (library: Library) => void;
  userLocation: UserLocation | null;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  highlightedLibraryIds?: string[];
}

export const LibraryList: React.FC<LibraryListProps> = ({
  libraries,
  selectedLibrary,
  onSelectLibrary,
  onOpenDetails,
  userLocation,
  favorites,
  onToggleFavorite,
  highlightedLibraryIds = [],
}) => {
  if (libraries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 my-8 mx-4">
        <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
          条件に該当する図書館が見つかりませんでした
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          検索キーワードや設備フィルターの条件を変更してお試しください。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
      {libraries.map((lib) => {
        const isSelected = selectedLibrary?.id === lib.id;
        const isFavorite = favorites.includes(lib.id);
        const isHighlighted = highlightedLibraryIds.includes(lib.id);
        const openInfo = getOpenStatus(lib.openingHours, lib.closedDays);
        const isPref = lib.type === 'prefectural';

        const dist = userLocation
          ? calculateDistance(userLocation.lat, userLocation.lng, lib.lat, lib.lng)
          : null;

        return (
          <div
            key={lib.id}
            onClick={() => onSelectLibrary(lib)}
            className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer ${
              isSelected
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                : isHighlighted
                ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-sm'
            }`}
          >
            {/* AI Recommendation Banner */}
            {isHighlighted && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AIおすすめの図書館</span>
              </div>
            )}

            <div className="p-4 space-y-3">
              {/* Header: Type Badge & Status & Distance */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isPref
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    }`}
                  >
                    {isPref ? '埼玉県立' : lib.municipality}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${openInfo.colorClass}`}
                  >
                    {openInfo.statusText}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {dist !== null && (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {formatDistance(dist)}
                    </span>
                  )}
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(lib.id);
                    }}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      isFavorite
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isFavorite ? '保存から解除' : 'お気に入りに保存'}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`}
                    />
                  </button>
                </div>
              </div>

              {/* Title & Station */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {lib.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{lib.nearestStation} ({lib.municipality})</span>
                </p>
              </div>

              {/* Description Snippet */}
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {lib.description}
              </p>

              {/* Opening Hours & Book count */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium truncate">{lib.openingHours}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>蔵書数: 約{(lib.bookCount / 10000).toFixed(0)}万冊</span>
                  <span>休館: {lib.closedDays.split('、')[0]}</span>
                </div>
              </div>

              {/* Facility Badges */}
              <div className="flex flex-wrap gap-1 pt-1">
                {lib.hasWifi && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    <Wifi className="w-3 h-3" /> Wi-Fi
                  </span>
                )}
                {lib.hasStudySeats && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    <Laptop className="w-3 h-3" /> 自習室
                  </span>
                )}
                {lib.hasParking && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Car className="w-3 h-3" /> 駐車場
                  </span>
                )}
                {lib.hasKidsArea && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                    <Baby className="w-3 h-3" /> キッズ
                  </span>
                )}
                {lib.isOpenNight && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    夜間開館
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Footer Actions */}
            <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-500 truncate">
                {lib.address}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(lib);
                }}
                className="shrink-0 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                詳細を見る <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
