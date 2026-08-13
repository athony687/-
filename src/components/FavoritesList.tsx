import React from 'react';
import { Library, UserLocation } from '../types';
import { calculateDistance, formatDistance } from '../utils/geo';
import { Bookmark, Trash2, MapPin, Navigation, BookOpen, Clock, FileText, ChevronRight } from 'lucide-react';

interface FavoritesListProps {
  favoriteLibraries: Library[];
  onOpenDetails: (library: Library) => void;
  onRemoveFavorite: (id: string) => void;
  userLocation: UserLocation | null;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favoriteLibraries,
  onOpenDetails,
  onRemoveFavorite,
  userLocation,
}) => {
  if (favoriteLibraries.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
          保存された図書館はありません
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          図書館のカードやお気に入りボタン（🔖）を押すと、ここにマイライブラリとして保存され、マイメモや短縮アクセスが可能です。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            保存したマイライブラリ ({favoriteLibraries.length}館)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            よく利用する図書館や気になるスポットをまとめて確認できます
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favoriteLibraries.map((lib) => {
          const dist = userLocation
            ? calculateDistance(userLocation.lat, userLocation.lng, lib.lat, lib.lng)
            : null;

          const savedMemo = localStorage.getItem(`memo_${lib.id}`);

          return (
            <div
              key={lib.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {lib.municipality}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                    {lib.name}
                  </h3>
                </div>

                <button
                  onClick={() => onRemoveFavorite(lib.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{lib.nearestStation} ({lib.address})</span>
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{lib.openingHours}</span>
                </p>
              </div>

              {savedMemo && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1 mb-0.5 text-[11px]">
                    <FileText className="w-3 h-3 text-amber-600" /> マイメモ:
                  </div>
                  <p className="line-clamp-2">{savedMemo}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {dist !== null ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" /> 現在地から {formatDistance(dist)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">蔵書: 約{(lib.bookCount / 10000).toFixed(0)}万冊</span>
                )}

                <button
                  onClick={() => onOpenDetails(lib)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  詳細・操作 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
