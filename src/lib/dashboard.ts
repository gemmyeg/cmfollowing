import { dueInfo, sortByUrgency, type DueInfo, type DueStatus } from '@/lib/maintenance';
import type { Car, MaintenanceItem, ServiceRecord } from '@/lib/types';

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

export function summarize(
  cars: Car[],
  itemsByCar: Record<string, MaintenanceItem[]>,
  servicesByCar: Record<string, ServiceRecord[]> = {},
  now = new Date(),
) {
  const services = cars.flatMap((c) => servicesByCar[c.id] ?? []);
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const spent = (from: number) =>
    services.filter((s) => s.date >= from).reduce((sum, s) => sum + s.totalCost, 0);

  const rows: DueRow[] = cars.flatMap((car) =>
    (itemsByCar[car.id] ?? []).map((item) => ({ car, item, due: dueInfo(item, car) })),
  );
  const attention = sortByUrgency(rows.filter((r) => r.due.status === 'overdue' || r.due.status === 'soon'));
  return {
    cars: cars.length,
    overdue: rows.filter((r) => r.due.status === 'overdue').length,
    soon: rows.filter((r) => r.due.status === 'soon').length,
    carsNeedingService: new Set(attention.map((r) => r.car.id)).size,
    spentYear: spent(yearStart),
    spentMonth: spent(monthStart),
    attention,
  };
}
