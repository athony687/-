import React, { useState, useEffect, useMemo } from 'react';
import { SAITAMA_LIBRARIES } from './data/libraries';
import { Library, FilterState, UserLocation } from './types';
import { calculateDistance } from './utils/geo';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { MapView } from './components/MapView';
import { LibraryList } from './components/LibraryList';
import { AiAssistant } from './components/AiAssistant';
import { FavoritesList } from './components/FavoritesList';
import { LibraryDetailModal } from './components/LibraryDetailModal';
import { Map, List, Bot, Bookmark, Navigation, Info, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'ai' | 'favorites'>('map');
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [detailModalLibrary, setDetailModalLibrary] = useState<Library | null>(null);

  // User location state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Saved Favorites in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saitama_fav_libraries');
      return saved ? JSON.parse(saved) : ['saitama-chuo', 'pref-kuki'];
    } catch {
      return ['saitama-chuo', 'pref-kuki'];
    }
  });

  // Highlighted IDs from AI Concierge
  const [highlightedLibraryIds, setHighlightedLibraryIds] = useState<string[]>([]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    municipality: 'すべて',
    type: 'all',
    hasWifi: false,
    hasStudySeats: false,
    hasParking: false,
    hasKidsArea: false,
    isOpenNight: false,
    isOpenToday: false,
    sortBy: 'name',
  });

  // Save favorites to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem('saitama_fav_libraries', JSON.stringify(favorites));
  }, [favorites]);

  // Request User Geolocation
  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報サービスに対応していません。');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          addressName: '現在地',
        });
        setIsLocating(false);
        // Automatically switch sort to distance
        setFilters((prev) => ({ ...prev, sortBy: 'distance' }));
      },
      (err) => {
        console.warn(err);
        setIsLocating(false);
        alert('位置情報の取得に失敗しました。位置情報の利用許可をご確認ください。');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter & Sort Logic
  const filteredLibraries = useMemo(() => {
    let result = [...SAITAMA_LIBRARIES];

    // Search Keyword filter
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (lib) =>
          lib.name.toLowerCase().includes(term) ||
          lib.municipality.toLowerCase().includes(term) ||
          lib.address.toLowerCase().includes(term) ||
          lib.nearestStation.toLowerCase().includes(term) ||
          lib.features.some((f) => f.toLowerCase().includes(term))
      );
    }

    // Municipality filter
    if (filters.municipality !== 'すべて') {
      result = result.filter((lib) => lib.municipality.includes(filters.municipality));
    }

    // Facility filter
    if (filters.type === 'prefectural') {
      result = result.filter((lib) => lib.type === 'prefectural');
    } else if (filters.type === 'municipal') {
      result = result.filter((lib) => lib.type === 'municipal');
    }

    if (filters.hasWifi) result = result.filter((lib) => lib.hasWifi);
    if (filters.hasStudySeats) result = result.filter((lib) => lib.hasStudySeats);
    if (filters.hasParking) result = result.filter((lib) => lib.hasParking);
    if (filters.hasKidsArea) result = result.filter((lib) => lib.hasKidsArea);
    if (filters.isOpenNight) result = result.filter((lib) => lib.isOpenNight);

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'distance' && userLocation) {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      }
      if (filters.sortBy === 'bookCount') {
        return b.bookCount - a.bookCount;
      }
      return a.name.localeCompare(b.name, 'ja');
    });

    return result;
  }, [searchTerm, filters, userLocation]);

  const favoriteLibraries = useMemo(() => {
    return SAITAMA_LIBRARIES.filter((lib) => favorites.includes(lib.id));
  }, [favorites]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        userLocation={userLocation}
        onGetUserLocation={handleGetUserLocation}
        isLocating={isLocating}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col">
        {/* Map View Mode */}
        {activeTab === 'map' && (
          <div className="flex-1 relative flex flex-col">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              totalCount={SAITAMA_LIBRARIES.length}
              filteredCount={filteredLibraries.length}
              userLocation={userLocation}
            />
            <MapView
              libraries={filteredLibraries}
              selectedLibrary={selectedLibrary}
              onSelectLibrary={setSelectedLibrary}
              onOpenDetails={setDetailModalLibrary}
              userLocation={userLocation}
              highlightedLibraryIds={highlightedLibraryIds}
            />
          </div>
        )}

        {/* List View Mode */}
        {activeTab === 'list' && (
          <div className="space-y-2 pb-12">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              totalCount={SAITAMA_LIBRARIES.length}
              filteredCount={filteredLibraries.length}
              userLocation={userLocation}
            />
            <LibraryList
              libraries={filteredLibraries}
              selectedLibrary={selectedLibrary}
              onSelectLibrary={(lib) => {
                setSelectedLibrary(lib);
                setDetailModalLibrary(lib);
              }}
              onOpenDetails={setDetailModalLibrary}
              userLocation={userLocation}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              highlightedLibraryIds={highlightedLibraryIds}
            />
          </div>
        )}

        {/* AI Assistant Mode */}
        {activeTab === 'ai' && (
          <div className="py-6">
            <AiAssistant
              libraries={SAITAMA_LIBRARIES}
              onOpenDetails={setDetailModalLibrary}
              onHighlightLibraries={(ids) => {
                setHighlightedLibraryIds(ids);
                setActiveTab('map');
              }}
            />
          </div>
        )}

        {/* Saved Favorites Mode */}
        {activeTab === 'favorites' && (
          <div className="py-6">
            <FavoritesList
              favoriteLibraries={favoriteLibraries}
              onOpenDetails={setDetailModalLibrary}
              onRemoveFavorite={toggleFavorite}
              userLocation={userLocation}
            />
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {detailModalLibrary && (
        <LibraryDetailModal
          library={detailModalLibrary}
          onClose={() => setDetailModalLibrary(null)}
          userLocation={userLocation}
          isFavorite={favorites.includes(detailModalLibrary.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 埼玉県図書館マップ — 埼玉県民のための公立図書館便利案内ツール
          </span>
          <span className="text-[11px] text-slate-400">
            掲載情報: 埼玉県立久喜・熊谷図書館 / 各市町村市立図書館
          </span>
        </div>
      </footer>
    </div>
  );
}
