import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Library, UserLocation } from '../types';
import { SAITAMA_CENTER } from '../data/libraries';
import { calculateDistance, formatDistance, getOpenStatus } from '../utils/geo';
import { Navigation, BookOpen, ExternalLink, Wifi, ShieldAlert, Sparkles } from 'lucide-react';

interface MapViewProps {
  libraries: Library[];
  selectedLibrary: Library | null;
  onSelectLibrary: (library: Library) => void;
  onOpenDetails: (library: Library) => void;
  userLocation: UserLocation | null;
  highlightedLibraryIds?: string[];
}

export const MapView: React.FC<MapViewProps> = ({
  libraries,
  selectedLibrary,
  onSelectLibrary,
  onOpenDetails,
  userLocation,
  highlightedLibraryIds = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Only init once

    const map = L.map(mapContainerRef.current, {
      center: [SAITAMA_CENTER.lat, SAITAMA_CENTER.lng],
      zoom: SAITAMA_CENTER.zoom,
      zoomControl: false,
    });

    // Add Tile Layer (OpenStreetMap Japan / Standard with fallback)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | 埼玉県図書館マップ',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Library Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m: L.Marker) => m.remove());
    markersRef.current = {};

    libraries.forEach((lib) => {
      const isSelected = selectedLibrary?.id === lib.id;
      const isHighlighted = highlightedLibraryIds.includes(lib.id);
      const isPref = lib.type === 'prefectural';

      // Custom marker HTML
      const pinColor = isSelected
        ? '#059669' // Emerald-600
        : isHighlighted
        ? '#f59e0b' // Amber-500
        : isPref
        ? '#0284c7' // Sky-600
        : '#0d9488'; // Teal-600

      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'
        }">
          <div style="background-color: ${pinColor}" class="w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          ${
            isHighlighted
              ? `<div class="absolute -top-2 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1 rounded-full animate-bounce">AIおすすめ</div>`
              : ''
          }
          <div class="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/80 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            ${lib.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lib.lat, lib.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const openInfo = getOpenStatus(lib.openingHours, lib.closedDays);
      const dist = userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, lib.lat, lib.lng)
        : null;

      const popupNode = document.createElement('div');
      popupNode.className = 'p-1 font-sans text-slate-800 max-w-xs';
      popupNode.innerHTML = `
        <div class="flex items-center gap-1.5 mb-1">
          <span class="px-1.5 py-0.5 text-[10px] font-bold rounded ${
            isPref ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'
          }">${isPref ? '埼玉県立' : lib.municipality}</span>
          <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded ${openInfo.colorClass}">
            ${openInfo.statusText}
          </span>
          ${dist !== null ? `<span class="text-[11px] font-bold text-slate-500 ml-auto">📍 ${formatDistance(dist)}</span>` : ''}
        </div>
        <h3 class="font-bold text-sm text-slate-900 mb-1 leading-snug">${lib.name}</h3>
        <p class="text-xs text-slate-600 mb-2 truncate">📍 ${lib.address}</p>
        <div class="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
          <span>🕒 ${lib.openingHours}</span>
        </div>
        <button id="popup-btn-${lib.id}" class="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow transition-colors flex items-center justify-center gap-1 cursor-pointer">
          詳細・設備を見る →
        </button>
      `;

      marker.bindPopup(popupNode);

      marker.on('click', () => {
        onSelectLibrary(lib);
        setTimeout(() => {
          const btn = document.getElementById(`popup-btn-${lib.id}`);
          if (btn) {
            btn.onclick = () => onOpenDetails(lib);
          }
        }, 50);
      });

      markersRef.current[lib.id] = marker;
    });
  }, [libraries, selectedLibrary, highlightedLibraryIds, userLocation]);

  // Handle Selected Library FlyTo
  useEffect(() => {
    if (!selectedLibrary || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedLibrary.lat, selectedLibrary.lng], 14, {
      duration: 1.2,
    });
    const marker = markersRef.current[selectedLibrary.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedLibrary]);

  // Handle User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          className: 'user-location-pin',
          html: `
            <div class="relative flex items-center justify-center w-6 h-6">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-md"></span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        userMarkerRef.current.bindTooltip('現在地', { permanent: false, direction: 'top' });
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Map Info Legend */}
      <div className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-1.5 pointer-events-auto max-w-[220px]">
        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>埼玉県内図書館 ({libraries.length}館)</span>
        </div>
        <div className="flex items-center gap-3 pt-1 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
            <span>埼玉県立</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span>市立・町立</span>
          </div>
        </div>
      </div>

      {/* Reset Map Center Button */}
      <button
        onClick={() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([SAITAMA_CENTER.lat, SAITAMA_CENTER.lng], SAITAMA_CENTER.zoom);
          }
        }}
        className="absolute bottom-6 right-3 z-20 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 p-2.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
        title="埼玉県全体を表示"
      >
        <Navigation className="w-4 h-4 text-emerald-600" />
        <span className="hidden sm:inline">埼玉全域へ戻る</span>
      </button>
    </div>
  );
};
