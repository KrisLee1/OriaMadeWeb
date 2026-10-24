import countryCodes from '@/features/oria-tab/shared/lib/calendar/countries.json' with { type: 'json' }

// Snapshot of Nager.Holidays /api/v4/Countries/Available, 2026-10-12.
export const holidayRegions: readonly string[] = countryCodes
export function validHolidayRegion(value: unknown): value is string {
  return value === 'none' || typeof value === 'string' && holidayRegions.includes(value)
}
export function defaultHolidayRegion(locale: string): string {
  try {
    const region = new Intl.Locale(locale).maximize().region
    if (region && validHolidayRegion(region)) return region
  } catch { /* Invalid saved/browser locale uses an explicit disabled default. */ }
  return 'none'
}
export function holidayRegionItems(language: string, noneLabel: string) {
  const names = new Intl.DisplayNames([language], { type: 'region' })
  return [{ value: 'none', label: noneLabel }, ...holidayRegions.map(value => ({ value, label: names.of(value) ?? value })).sort((a, b) => a.label.localeCompare(b.label, language))]
}
