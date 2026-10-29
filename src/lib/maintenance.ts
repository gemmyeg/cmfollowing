import type { TFunction } from 'i18next';

import type { Car, MaintenanceItem } from '@/lib/types';

export type RecommendedItem = {
  key: string;
  intervalKm: number | null;
  intervalMonths: number | null;
};

/**
 * Typical intervals for a petrol passenger car. Every car gets these by default and the
 * admin can change or remove any of them. Names live in the translations under items.<key>.
 */
export const RECOMMENDED_ITEMS: RecommendedItem[] = [
  { key: 'engineOil', intervalKm: 10000, intervalMonths: 6 },
  { key: 'oilFilter', intervalKm: 10000, intervalMonths: 6 },
  { key: 'airFilter', intervalKm: 20000, intervalMonths: 12 },
  { key: 'cabinFilter', intervalKm: 15000, intervalMonths: 12 },
  { key: 'fuelFilter', intervalKm: 40000, intervalMonths: 24 },
  { key: 'sparkPlugs', intervalKm: 40000, intervalMonths: 24 },
  { key: 'brakePads', intervalKm: 30000, intervalMonths: null },
  { key: 'brakeFluid', intervalKm: 40000, intervalMonths: 24 },
  { key: 'coolant', intervalKm: 40000, intervalMonths: 24 },
  { key: 'transmissionFluid', intervalKm: 60000, intervalMonths: 48 },
  { key: 'timingBelt', intervalKm: 60000, intervalMonths: 48 },
  { key: 'tireRotation', intervalKm: 10000, intervalMonths: 6 },
  { key: 'wheelAlignment', intervalKm: 20000, intervalMonths: 12 },
  { key: 'tires', intervalKm: 50000, intervalMonths: 48 },
  { key: 'battery', intervalKm: null, intervalMonths: 36 },
  { key: 'wipers', intervalKm: null, intervalMonths: 12 },
  { key: 'acService', intervalKm: null, intervalMonths: 12 },
];

/** An item is "due soon" within this many km or days. */
export const SOON_KM = 1000;
export const SOON_DAYS = 30;

export type DueStatus = 'ok' | 'soon' | 'overdue' | 'unknown';

export type DueInfo = {
  status: DueStatus;
  dueKm: number | null;
  dueAt: number | null;
  remainingKm: number | null;
  remainingDays: number | null;
  /** Estimated date the item is due: the earlier of dueAt and when dueKm should be reached. */
  predictedAt: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Used until a car has two readings at least a week apart (about 15,000 km a year). */
export const DEFAULT_KM_PER_DAY = 40;

export function kmPerDay(
  car: Pick<Car, 'currentKm' | 'currentKmAt' | 'initialKm' | 'initialKmAt'>,
): number {
  if (car.initialKm == null || car.initialKmAt == null) return DEFAULT_KM_PER_DAY;
  const days = (car.currentKmAt - car.initialKmAt) / DAY_MS;
  const km = car.currentKm - car.initialKm;
  if (days < 7 || km <= 0) return DEFAULT_KM_PER_DAY;
  return km / days;
}

function addMonths(ts: number, months: number): number {
  const d = new Date(ts);
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

/** Works out when an item is next due, by km and/or by date, whichever comes first. */
type CarKm = Pick<Car, 'currentKm' | 'currentKmAt' | 'initialKm' | 'initialKmAt'>;

export function dueInfo(item: MaintenanceItem, car: CarKm, now = Date.now()): DueInfo {
  const dueKm =
    item.intervalKm != null && item.lastDoneKm != null ? item.lastDoneKm + item.intervalKm : null;
  const dueAt =
    item.intervalMonths != null && item.lastDoneAt != null
      ? addMonths(item.lastDoneAt, item.intervalMonths)
      : null;
  const remainingKm = dueKm != null ? dueKm - car.currentKm : null;
  const remainingDays = dueAt != null ? Math.floor((dueAt - now) / DAY_MS) : null;

  let status: DueStatus = 'unknown';
  if (remainingKm != null || remainingDays != null) {
    const overdue = (remainingKm != null && remainingKm <= 0) || (remainingDays != null && remainingDays <= 0);
    const soon =
      (remainingKm != null && remainingKm <= SOON_KM) ||
      (remainingDays != null && remainingDays <= SOON_DAYS);
    status = overdue ? 'overdue' : soon ? 'soon' : 'ok';
  }

  const kmDate =
    remainingKm != null ? car.currentKmAt + (remainingKm / kmPerDay(car)) * DAY_MS : null;
  const candidates = [dueAt, kmDate].filter((d): d is number => d != null);
  const predictedAt = candidates.length ? Math.min(...candidates) : null;

  return { status, dueKm, dueAt, remainingKm, remainingDays, predictedAt };
}

const STATUS_ORDER: Record<DueStatus, number> = { overdue: 0, soon: 1, ok: 2, unknown: 3 };

/** Most urgent first. */
export function sortByUrgency<T extends { due: DueInfo }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const s = STATUS_ORDER[a.due.status] - STATUS_ORDER[b.due.status];
    if (s !== 0) return s;
    return (a.due.remainingKm ?? Infinity) - (b.due.remainingKm ?? Infinity);
  });
}

/** Display name: the translated built-in name, or the custom name. */
export function itemName(item: Pick<MaintenanceItem, 'key' | 'name'>, t: TFunction) {
  return item.key ? t(`items.${item.key}`) : item.name;
}
