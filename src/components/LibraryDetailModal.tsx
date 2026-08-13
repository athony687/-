import React, { useState, useEffect } from 'react';
import { Library, UserLocation } from '../types';
import { calculateDistance, formatDistance, getOpenStatus } from '../utils/geo';
import {
  X,
  MapPin,
  Phone,
  Globe,
  Clock,
  Calendar,
  Car,
  Wifi,
  Laptop,
  Coffee,
  Baby,
  Heart,
  Accessibility,
  Disc,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  FileText,
  Save,
  Share2
} from 'lucide-react';

interface LibraryDetailModalProps {
  library: Library | null;
  onClose: () => void;
  userLocation: UserLocation | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const LibraryDetailModal: React.FC<LibraryDetailModalProps> = ({
  library,
  onClose,
  userLocation,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [memo, setMemo] = useState('');
  const [isSavedMemo, setIsSavedMemo] = useState(false);

  useEffect(() => {
    if (library) {
      const savedMemo = localStorage.getItem(`memo_${library.id}`) || '';
      setMemo(savedMemo);
      setIsSavedMemo(false);
    }
  }, [library]);

  if (!library) return null;

  const openInfo = getOpenStatus(library.openingHours, library.closedDays);
  const dist = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, library.lat, library.lng)
    : null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${library.name} ${library.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveMemo = () => {
    localStorage.setItem(`memo_${library.id}`, memo);
    setIsSavedMemo(true);
    setTimeout(() => setIsSavedMemo(false), 2000);
  };

  const googleMapsRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    library.name + ' ' + library.address
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            title="閉じる"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap pr-8">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs">
              {library.type === 'prefectural' ? '埼玉県立図書館' : library.municipality}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${openInfo.colorClass}`}>
              {openInfo.statusText}
            </span>
            {dist !== null && (
              <span className="text-xs font-semibold bg-emerald-950/60 text-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                現在地から {formatDistance(dist)}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">{library.name}</h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 flex items-center gap-1">
            <MapPin className="w-4 h-4 shrink-0 opacity-80" />
            {library.address}
          </p>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {/* Quick Action Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <a
              href={googleMapsRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Googleマップで経路</span>
            </a>

            <a
              href={library.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>公式HP・蔵書検索</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={() => onToggleFavorite(library.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer col-span-2 sm:col-span-1 ${
                isFavorite
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              <span>{isFavorite ? '保存済み' : 'お気に入り保存'}</span>
            </button>
          </div>

          {/* Description */}
          <div className="bg-emerald-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-emerald-100 dark:border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {library.description}
          </div>

          {/* Opening & Access Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            {/* Opening Hours & Closed Days */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900 dark:text-slate-100 mb-0.5">
                    開館時間
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-snug">{library.openingHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <Calendar className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900 dark:text-slate-100 mb-0.5">
                    休館日
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-snug">{library.closedDays}</p>
                </div>
              </div>
            </div>

            {/* Access, Station & Phone */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900 dark:text-slate-100 mb-0.5">
                    最寄駅・アクセス
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-snug">{library.nearestStation}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{library.accessInfo}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <Phone className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900 dark:text-slate-100 mb-0.5">
                    電話番号 / 駐車場
                  </span>
                  <a
                    href={`tel:${library.phone}`}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline block"
                  >
                    📞 {library.phone}
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    🚗 {library.parking}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Facility Checklist Grid */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
              <span>館内設備 & サービス一覧</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  library.hasWifi
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                }`}
              >
                <Wifi className="w-4 h-4" /> Wi-Fi完備
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  library.hasStudySeats
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                }`}
              >
                <Laptop className="w-4 h-4" /> 自習・PC席あり
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  library.hasCafeOrRestArea
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                }`}
              >
                <Coffee className="w-4 h-4" /> カフェ・飲食席
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  library.hasKidsArea
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                }`}
              >
                <Baby className="w-4 h-4" /> キッズスペース
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  library.hasNursingRoom
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                }`}
              >
                <Heart className="w-4 h-4" /> 授乳室完備
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  library.hasBarrierFree
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                }`}
              >
                <Accessibility className="w-4 h-4" /> バリアフリー
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  library.hasAvSection
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                }`}
              >
                <Disc className="w-4 h-4" /> AV・CD試聴
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  library.isOpenNight
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                }`}
              >
                <Clock className="w-4 h-4" /> 20時以降も開館
              </div>
            </div>
          </div>

          {/* Features Tag Pills */}
          <div>
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">
              特徴・特色コレクション
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {library.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  #{feat}
                </span>
              ))}
            </div>
          </div>

          {/* Personal Memo Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                マイメモ（個人的なメモ・覚え書き）
              </label>
              {isSavedMemo && (
                <span className="text-xs font-bold text-emerald-600 animate-pulse flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 保存しました
                </span>
              )}
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="例: 3階の自習席は静かでコンセントあり。第3月曜は休館なので注意。"
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              rows={2}
            />
            <button
              onClick={handleSaveMemo}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 ml-auto cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              メモを保存
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '住所をコピーしました' : '名称と住所をコピー'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
