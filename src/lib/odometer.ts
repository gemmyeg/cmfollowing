import { requireOptionalNativeModule } from 'expo';

import { kmPerDay } from '@/lib/maintenance';
import type { Car } from '@/lib/types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** On-device text recognition is only in development/store builds, not in Expo Go. */
export const canReadOdometer = requireOptionalNativeModule('ExpoTextExtractor') != null;

/** Pulls every 3 to 7 digit number out of the recognised text ("123 456", "123,456" count as one). */
export function numberCandidates(lines: string[]): number[] {
  const found = new Set<number>();
  for (const line of lines) {
    const normalized = line.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    for (const match of normalized.match(/\d[\d\s,.]*\d|\d/g) ?? []) {
      const digits = match.replace(/[\s,.]/g, '');
      if (digits.length >= 3 && digits.length <= 7) found.add(Number(digits));
    }
  }
  return [...found];
}

/**
 * Picks the reading that makes sense for this car: not below the last reading, not absurdly
 * far above it, and closest to what we expect from its usual km per day.
 */
export function bestReading(candidates: number[], car: Car, now = Date.now()): number | null {
  const expected = car.currentKm + kmPerDay(car) * ((now - car.currentKmAt) / DAY_MS);
  const plausible = candidates.filter((n) => n >= car.currentKm && n <= car.currentKm + 100000);
  if (!plausible.length) return null;
  return plausible.reduce((best, n) => (Math.abs(n - expected) < Math.abs(best - expected) ? n : best));
}

/** Reads the km from an odometer photo, or null if it can't (the user then types it). */
export async function readOdometer(uri: string, car: Car): Promise<number | null> {
  if (!canReadOdometer) return null;
  try {
    const { extractTextFromImage } = require('expo-text-extractor') as typeof import('expo-text-extractor');
    return bestReading(numberCandidates(await extractTextFromImage(uri)), car);
  } catch {
    return null;
  }
}
