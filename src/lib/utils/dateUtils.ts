export function toISOString(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString();
  }
  return date;
}