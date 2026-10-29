/** Parses "1,250.50" or "١٢٥٠" into piasters; undefined if it isn't a valid amount. */
export function parseEgp(text: string): number | undefined {
  const normalized = text
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[٫]/g, '.')
    .replace(/[,\s٬]/g, '');
  if (normalized === '') return 0;
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

/** Formats piasters as "1,250.50 ج.م" or "EGP 1,250.50". */
export function formatEgp(piasters: number, language: string): string {
  const amount = (piasters / 100).toLocaleString('en-US', {
    minimumFractionDigits: piasters % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return language === 'ar' ? `${amount} ج.م` : `EGP ${amount}`;
}
