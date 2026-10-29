import { dueInfo, sortByUrgency, type DueInfo, type DueStatus } from '@/lib/maintenance';
import type { Car, MaintenanceItem } from '@/lib/types';

export type DueRow = { car: Car; item: MaintenanceItem; due: DueInfo };

const RANK: Record<DueStatus, number> = { overdue: 0, soon: 1, ok: 2, unknown: 3 };

/** The most urgent status among a car's items. */
export function worstStatus(car: Car, items: MaintenanceItem[]): DueStatus {
  let worst: DueStatus = 'unknown';
  for (const item of items) {
    const s = dueInfo(item, car).status;
    if (RANK[s] < RANK[worst]) worst = s;
  }
  return worst;
}

export function summarize(cars: Car[], itemsByCar: Record<string, MaintenanceItem[]>) {
  const rows: DueRow[] = cars.flatMap((car) =>
    (itemsByCar[car.id] ?? []).map((item) => ({ car, item, due: dueInfo(item, car) })),
  );
  const attention = sortByUrgency(rows.filter((r) => r.due.status === 'overdue' || r.due.status === 'soon'));
  return {
    cars: cars.length,
    overdue: rows.filter((r) => r.due.status === 'overdue').length,
    soon: rows.filter((r) => r.due.status === 'soon').length,
    carsNeedingService: new Set(attention.map((r) => r.car.id)).size,
    attention,
  };
}
