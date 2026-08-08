// Spaced repetition intervals (days)
const DEFAULT_INTERVALS = [3, 7, 14, 30];

export function getNextInterval(currentIntervalDays: number, wasCorrect: boolean): number {
  if (!wasCorrect) {
    return DEFAULT_INTERVALS[0];
  }

  const idx = DEFAULT_INTERVALS.indexOf(currentIntervalDays);
  if (idx === -1 || idx === DEFAULT_INTERVALS.length - 1) {
    return DEFAULT_INTERVALS[DEFAULT_INTERVALS.length - 1];
  }

  return DEFAULT_INTERVALS[idx + 1];
}

export function getInitialReviewDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_INTERVALS[0]);
  return date;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
