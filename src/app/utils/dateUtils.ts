// Date utilities for subscription/trial/grace calculations

/**
 * Calculate remaining days from a start date plus a number of days.
 * Defaults to 30 days if daysToAdd is not provided.
 */
export function calculateDaysRemaining(
  startDate: string | null | undefined,
  daysToAdd: number = 30
): number {
  try {
    if (!startDate) return 0;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return 0;
    const target = new Date(start);
    target.setDate(target.getDate() + daysToAdd);
    const now = new Date();
    const ms = target.getTime() - now.getTime();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  } catch {
    return 0;
  }
}

/**
 * Format an ISO date string in he-IL locale (DD/MM/YYYY by default).
 */
export function formatDate(
  dateInput: string | number | Date | null | undefined,
  locale = 'he-IL'
): string {
  try {
    if (dateInput === null || dateInput === undefined) return '';
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(locale);
  } catch {
    return '';
  }
}

/**
 * Check if a cancellation date is still within the grace period.
 * Defaults to 30 days grace.
 */
export function isInGracePeriod(
  cancellationDate: string | null | undefined,
  graceDays: number = 30
): boolean {
  try {
    if (!cancellationDate) return false;
    const cancel = new Date(cancellationDate);
    if (isNaN(cancel.getTime())) return false;
    const end = new Date(cancel);
    end.setDate(end.getDate() + graceDays);
    return new Date() <= end;
  } catch {
    return false;
  }
}

