import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { dayKey, formatDateShort, todayKey } from "../../../api/revisionUtils";
import SectionHeader from "./SectionHeader";
import type { revisionStatusResponseType } from "@repo/types/apiResponse/revisionStatusResponseType";

interface DayData {
    total: number;
    done: number;
    overdue: number;
    questions: string[];
}

const DAY_MS = 86400000;

function buildMonthDays(year: number, month: number): Array<Date | null> {
    const first = new Date(Date.UTC(year, month, 1));
    const offset = first.getUTCDay(); // 0 = Sunday
    const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells: Array<Date | null> = Array.from({ length: offset }, () => null);
    for (let i = 1; i <= count; i++) cells.push(new Date(Date.UTC(year, month, i)));
    // Pad to six full weeks (42 cells) so the grid always looks complete
    while (cells.length < 42) cells.push(null);
    return cells;
}

function buildWeekDays(): Date[] {
    const today = new Date();
    const dayNum = today.getUTCDay();
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - ((dayNum + 6) % 7)));
    return Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * DAY_MS));
}

export default function RevisionCalendar({ schedules }: { schedules: revisionStatusResponseType["schedules"] }) {
    const today = todayKey();
    const [view, setView] = useState<"month" | "week">("month");
    const [month, setMonth] = useState(() => ({ y: new Date().getUTCFullYear(), m: new Date().getUTCMonth() }));
    const [selected, setSelected] = useState<string | null>(null);

    const dayMap = useMemo(() => {
        const map = new Map<string, DayData>();
        for (const s of schedules) {
            const k = dayKey(s.scheduledDate);
            let e = map.get(k);
            if (!e) {
                e = { total: 0, done: 0, overdue: 0, questions: [] };
                map.set(k, e);
            }
            e.questions.push(s.record?.questionTitle ?? "Question");
            if (s.status === "completed") e.done += 1;
            else {
                e.total += 1;
                if (k < today) e.overdue += 1;
            }
        }
        return map;
    }, [schedules, today]);

    const cells = view === "month" ? buildMonthDays(month.y, month.m) : buildWeekDays();
    const monthTitle = new Date(Date.UTC(month.y, month.m, 1)).toLocaleDateString(undefined, { year: "numeric", month: "long" });
    const selectedData = selected ? dayMap.get(selected) : null;

    const shiftMonth = (d: number) => {
        const total = month.y * 12 + month.m + d;
        setMonth({ y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 });
    };

    const isSelected = (k: string) => selected === k;

    return (
        <section className="mb-6">
            <SectionHeader icon={Calendar} title="Calendar" />
            <div className="bg-white dark:bg-[#0f172a] border dark:border-white/[0.06] rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setView("month")} className={`text-xs px-2 py-1 rounded ${view === "month" ? "text-blue-500 font-bold" : "text-gray-500 dark:text-gray-400 hover:bg-white/[0.08]"}`}>Month</button>
                        <button onClick={() => setView("week")} className={`text-xs px-2 py-1 rounded ${view === "week" ? "text-blue-500 font-bold" : "text-gray-500 dark:text-gray-400 hover:bg-white/[0.08]"}`}>Week</button>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white ml-2">{view === "month" ? monthTitle : `Week of ${formatDateShort(new Date())}`}</span>
                    </div>
                    {view === "month" && (
                        <div className="flex gap-1">
                            <button onClick={() => shiftMonth(-1)} className="text-xs px-2 py-1 rounded hover:bg-white/[0.08] text-gray-500 dark:text-gray-400">‹</button>
                            <button onClick={() => shiftMonth(1)} className="text-xs px-2 py-1 rounded hover:bg-white/[0.08] text-gray-500 dark:text-gray-400">›</button>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {view === "month" && ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                        <div key={d} className="text-[10px] font-bold text-gray-400 text-center py-1">{d}</div>
                    ))}
                    {cells.map((cell, i) => {
                        if (!cell) return <div key={i} className="w-10 h-10" />;
                        const k = dayKey(cell);
                        const e = dayMap.get(k);
                        const isToday = k === today;
                        const sel = isSelected(k);
                        return (
                            <button
                                key={k}
                                onClick={() => setSelected(sel ? null : k)}
                                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-end text-xs font-semibold transition-colors ${isToday ? "bg-blue-600 text-white" : ""} ${sel ? "ring-2 ring-blue-400" : ""} ${e && e.total > 0 && !isToday ? "bg-gray-50 dark:bg-white/[0.04]" : ""}`}
                            >
                                {e && e.total > 0 && <span className={e.overdue > 0 ? "text-red-500" : "text-gray-500 dark:text-gray-400"}>{e.total}</span>}
                                {e && e.done > 0 && <span className="text-emerald-500">{e.done}</span>}
                                <span className="text-[10px] text-gray-400 opacity-70">{cell.getUTCDate()}</span>
                            </button>
                        );
                    })}
                </div>
                <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">Numbers = pending revisions, green = completed, red = overdue.</p>
                {selected && selectedData && selectedData.questions.length > 0 && (
                    <div className="mt-3 border-t dark:border-white/[0.06] pt-3">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1.5">Questions scheduled on {formatDateShort(selected)}</p>
                        <ul className="space-y-0.5">
                            {selectedData.questions.map((q, i) => (
                                <li key={i} className="text-xs text-gray-700 dark:text-gray-200">· {q}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
