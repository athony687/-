import React from 'react';
import { FilterState, UserLocation } from '../types';
import { MUNICIPALITIES } from '../data/libraries';
import { Wifi, Laptop, Car, Baby, Moon, Clock, ArrowUpDown, Filter, Sparkles } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCount: number;
  filteredCount: number;
  userLocation: UserLocation | null;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalCount,
  filteredCount,
  userLocation,
}) => {
  const toggleFacility = (key: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-2xs">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Upper Row: Municipality + Type Filter + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Municipality Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-600" /> 地域:
            </span>
            <select
              value={filters.municipality}
              onChange={(e) => setFilters((prev) => ({ ...prev, municipality: e.target.value }))}
              className="text-xs sm:text-sm font-medium bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>
                  {m === 'すべて' ? '埼玉県内すべて' : m}
                </option>
              ))}
            </select>
          </div>

          {/* Type Toggle: All / Prefectural / Municipal */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, type: 'all' }))}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filters.type === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              全施設
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, type: 'prefectural' }))}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filters.type === 'prefectural'
                  ? 'bg-sky-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              埼玉県立
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, type: 'municipal' }))}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filters.type === 'municipal'
                  ? 'bg-teal-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              市立・町立
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as 'distance' | 'name' | 'bookCount',
                }))
              }
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="distance" disabled={!userLocation}>
                {userLocation ? '現在地から近い順' : '現在地未設定 (近い順不可)'}
              </option>
              <option value="name">名称順</option>
              <option value="bookCount">蔵書数が多い順</option>
            </select>
          </div>
        </div>

        {/* Lower Row: Facility Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            条件絞り込み:
          </span>

          <button
            onClick={() => toggleFacility('hasWifi')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              filters.hasWifi
                ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <Wifi className="w-3 h-3" />
            <span>Wi-Fi完備</span>
          </button>

          <button
            onClick={() => toggleFacility('hasStudySeats')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              filters.hasStudySeats
                ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <Laptop className="w-3 h-3" />
            <span>自習・学習席</span>
          </button>

          <button
            onClick={() => toggleFacility('hasParking')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              filters.hasParking
                ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <Car className="w-3 h-3" />
            <span>駐車場あり</span>
          </button>

          <button
            onClick={() => toggleFacility('hasKidsArea')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              filters.hasKidsArea
                ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <Baby className="w-3 h-3" />
            <span>キッズエリア</span>
          </button>

          <button
            onClick={() => toggleFacility('isOpenNight')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              filters.isOpenNight
                ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>夜間(20時以降)開館</span>
          </button>

          {/* Results Counter */}
          <div className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
            該当: <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{filteredCount}</span> / {totalCount} 館
          </div>
        </div>
      </div>
    </div>
  );
};
