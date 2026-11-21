import type { revisionRecordType } from "@repo/types/apiResponse/revisionRecordType";

function pad(n: number): string {
    return String(n).padStart(2, "0");
}

/** ISO YYYY-MM-DD key in UTC (mirrors the backend dayKey). */
export function dayKey(d: Date | string): string {
    const t = new Date(d);
    return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function todayKey(): string {
    return dayKey(new Date());
}

/** ISO date string usable by HTML date inputs ("YYYY-MM-DD"). */
export function toISODate(d: Date | string): string {
    return new Date(d).toISOString().slice(0, 10);
}

/** Days between two YYYY-MM-DD keys; negative if the target day is in the past. */
export function daysBetweenKeys(targetKey: string, baseKey: string): number {
    const a = Date.parse(`${targetKey}T00:00:00Z`);
    const b = Date.parse(`${baseKey}T00:00:00Z`);
    if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
    return Math.round((a - b) / 86400000);
}

export function formatDate(d: Date | string | null | undefined): string {
    if (!d) return "-";
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateShort(d: Date | string | null | undefined): string {
    if (!d) return "-";
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function capitalize(s: string): string {
    return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export function difficultyClass(difficulty: string | null | undefined): string {
    if (difficulty === "easy") return "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300";
    if (difficulty === "medium") return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300";
    if (difficulty === "hard") return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
    return "bg-gray-100 dark:bg-gray-800 text-gray-500";
}

export function pillClass(color: "blue" | "gray" | "emerald" | "red"): string {
    const map: Record<string, string> = {
        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        gray: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
        emerald: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
        red: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
    };
    return `text-[11px] font-bold px-3 py-[2px] rounded-full ${map[color]}`;
}

export function actionButtonClass(color: "blue" | "emerald"): string {
    return color === "blue"
        ? "bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1 rounded-full text-[12px] font-semibold transition-colors"
        : "bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1 rounded-full text-[12px] font-semibold transition-colors";
}

/** Bucket of an upcoming schedule: "tomorrow" | "next7" | "next15" | "next30" | null (today/past). */
/** Shared card style used across the tracker: consistent, hover-liftable. */
export const cardBaseClass =
    "bg-white dark:bg-[#0f172a] border dark:border-white/[0.06] rounded-xl shadow-sm transition-all duration-200 hover:translate-y-[-1px] hover:shadow-md";

export function upcomingBucket(scheduledDate: Date | string): "tomorrow" | "next7" | "next15" | "next30" | null {
    const d = daysBetweenKeys(dayKey(scheduledDate), todayKey());
    if (Number.isNaN(d)) return null;
    if (d === 1) return "tomorrow";
    if (d <= 7) return "next7";
    if (d <= 15) return "next15";
    if (d <= 30) return "next30";
    return null;
}

/** Client-side filter matching the search box and the difficulty selector. */
export function matchesFilters<T extends { record: revisionRecordType | null }>(
    item: T,
    search: string,
    difficultyFilter: string
): boolean {
    const record = item.record;
    if (!record) return false;
    const q = search.trim().toLowerCase();
    if (q && !record.questionTitle.toLowerCase().includes(q)) return false;
    if (difficultyFilter !== "all" && record.difficulty !== difficultyFilter) return false;
    return true;
}

