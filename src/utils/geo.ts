import { Library, UserLocation } from '../types';

/**
 * Calculates distance in kilometers between two coordinates using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Format distance to human readable string
 */
export function formatDistance(distKm: number): string {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)}m`;
  }
  return `${distKm.toFixed(1)}km`;
}

/**
 * Major landmark locations in Saitama for quick distance comparison
 */
export const SAITAMA_STATIONS: { name: string; lat: number; lng: number }[] = [
  { name: '大宮駅 (さいたま市)', lat: 35.9063, lng: 139.6234 },
  { name: '浦和駅 (さいたま市)', lat: 35.8587, lng: 139.6582 },
  { name: '川越駅 (川越市)', lat: 35.9071, lng: 139.4828 },
  { name: '川口駅 (川口市)', lat: 35.8016, lng: 139.7183 },
  { name: '所沢駅 (所沢市)', lat: 35.7865, lng: 139.4731 },
  { name: '熊谷駅 (熊谷市)', lat: 36.1396, lng: 139.3897 },
  { name: '久喜駅 (久喜市)', lat: 36.0658, lng: 139.6778 },
  { name: '越谷駅 (越谷市)', lat: 35.8953, lng: 139.7864 },
  { name: '朝霞駅 (朝霞市)', lat: 35.7972, lng: 139.5932 },
  { name: '西武秩父駅 (秩父市)', lat: 35.9902, lng: 139.0831 }
];

/**
 * Checks if a library is likely open today / open now based on basic hour string
 */
export function getOpenStatus(openingHours: string, closedDays: string): { isOpen: boolean; statusText: string; colorClass: string } {
  const now = new Date();
  const day = now.getDay(); // 0: Sun, 1: Mon ...
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  // Simple check for Monday closure
  if (day === 1 && closedDays.includes('月曜日') && !closedDays.includes('月曜日（祝日の場合は開館）')) {
    return { isOpen: false, statusText: '本日休館日 (月曜)', colorClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
  }

  // Rough hour extraction
  if (currentHour >= 9 && currentHour < 18) {
    return { isOpen: true, statusText: '開館中', colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
  } else if (currentHour >= 18 && currentHour < 21) {
    if (openingHours.includes('20:00') || openingHours.includes('21:00') || openingHours.includes('21:30')) {
      return { isOpen: true, statusText: '夜間開館中', colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
    }
    return { isOpen: false, statusText: '本日閉館 (夜間)', colorClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
  }

  return { isOpen: false, statusText: '時間外', colorClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
}
