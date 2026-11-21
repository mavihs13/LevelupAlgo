const MS_PER_DAY = 86400000;

/**
 * Spaced-repetition revision intervals in days from the original solve date,
 * matching the Excel tracker:
 *   Rev 1 +3d, Rev 2 +7d, Rev 3 +15d, Rev 4 +30d, Rev 5 +60d, Rev 6 +120d.
 * Verified against your example: solve Jan 1, 2027 → Rev 1 Jan 4,
 * Rev 2 Jan 8, Rev 3 Jan 16, Rev 4 Jan 31, Rev 5 Mar 2, Rev 6 May 1.
 */
export const REVISION_INTERVALS = [3, 7, 15, 30, 60, 120];

export interface RevisionScheduleLike {
    revisionNumber: number;
    status: string;
    scheduledDate: Date;
    rescheduledFrom?: Date | null;
}

/** Normalize a Date to UTC midnight so all date math is day-based. */
export function normalizeDay(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Add n days (n may be negative) to a UTC-day value. */
export function addDaysUtc(day: Date, n: number): Date {
    return new Date(day.getTime() + n * MS_PER_DAY);
}

/** Signed day difference a − b; both normalized to UTC days. */
export function dayDiff(a: Date, b: Date): number {
    return Math.round((normalizeDay(a).getTime() - normalizeDay(b).getTime()) / MS_PER_DAY);
}

/** ISO YYYY-MM-DD key for a date (UTC). */
export function dayKey(d: Date): string {
    const t = normalizeDay(d);
    const month = String(t.getUTCMonth() + 1).padStart(2, "0");
    const day = String(t.getUTCDate()).padStart(2, "0");
    return `${t.getUTCFullYear()}-${month}-${day}`;
}

export function isToday(d: Date, now: Date = new Date()): boolean {
    return dayKey(d) === dayKey(now);
}

/** Date for a given revision of a record, or null for invalid revision numbers. */
export function computeScheduleDate(originalSolvedAt: Date, revisionNumber: number): Date | null {
    if (!Number.isInteger(revisionNumber) || revisionNumber < 1 || revisionNumber > REVISION_INTERVALS.length) {
        return null;
    }
    const interval = REVISION_INTERVALS[revisionNumber - 1];
    if (!interval) {
        return null;
    }
    return addDaysUtc(normalizeDay(originalSolvedAt), interval);
}

/**
 * Generate the revision schedules for a record from its original solve date.
 * Six rows (Revisions 1..6); every schedule is pending with the
 * interval-based date.
 */
export function computeSchedules(originalSolvedAt: Date) {
    return REVISION_INTERVALS.map((intervalDays, idx) => {
        const revisionNumber = idx + 1;
        return {
            revisionNumber,
            intervalDays,
            scheduledDate: addDaysUtc(normalizeDay(originalSolvedAt), intervalDays),
            status: "pending" as const
        };
    });
}

/**
 * Regenerate every *pending* schedule relative to a new original solve date.
 * Completed schedules are preserved untouched; when a date changes, the old
 * date is recorded in rescheduledFrom.
 */
export function regeneratePendingSchedules(originalSolvedAt: Date, schedules: RevisionScheduleLike[]): void {
    const base = normalizeDay(originalSolvedAt);
    for (const s of schedules) {
        if (s.status !== "pending") continue;
        const interval = REVISION_INTERVALS[s.revisionNumber - 1];
        if (!interval) continue;
        const newDate = addDaysUtc(base, interval);
        if (newDate.getTime() !== s.scheduledDate.getTime()) {
            s.rescheduledFrom = s.scheduledDate;
        }
        s.scheduledDate = newDate;
    }
}
