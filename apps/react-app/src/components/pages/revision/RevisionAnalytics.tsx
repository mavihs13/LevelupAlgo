import { useRecoilValue } from "recoil";
import { Activity } from "lucide-react";
import { capitalize, formatDateShort } from "../../../api/revisionUtils";
import { revisionStatsState } from "../../../recoilstates/revision/revisionState";
import SectionHeader from "./SectionHeader";

interface BarProps {
    label: string;
    value: number;
    max?: number;
    suffix?: string;
    sub?: string;
}

function StatBar({ label, value, max = 100, suffix = "", sub }: BarProps) {
    const width = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-300">{label}</span>
                <span className="text-gray-600 dark:text-gray-300">
                    {value}{suffix}
                </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 dark:bg-blue-400 rounded-full" style={{ width: `${width}%` }} />
            </div>
            {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
        </div>
    );
}

export default function RevisionAnalytics() {
    const stats = useRecoilValue(revisionStatsState);
    if (!stats) return null;
    const s = stats;
    const maxWeek = Math.max(1, ...s.weeklyActivity.map((w) => w.attempts));

    return (
        <section className="mb-6">
            <SectionHeader icon={Activity} title="Revision Analytics" count={s.byRevision.length} />
            <div className="bg-white dark:bg-[#0f172a] border dark:border-white/[0.06] rounded-xl px-5 py-4 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Revision Progress by Number</h3>
                {s.byRevision.map((b) => (
                    <StatBar key={b.revisionNumber} label={`Rev ${b.revisionNumber} (+${b.intervalDays}d)`} value={b.completed} max={Math.max(1, b.total)} suffix=" completed" />
                ))}

                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mt-3">Difficulty-Wise Performance</h3>
                {s.difficultyWise.map((d) => (
                    <StatBar key={d.difficulty} label={capitalize(d.difficulty)} value={d.completed} max={Math.max(1, d.total)} suffix=" completed" />
                ))}

                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mt-3">Confidence Improvement by Revision</h3>
                {s.confidenceImprovement.map((c) => (
                    <StatBar
                        key={c.revisionNumber}
                        label={`Rev ${c.revisionNumber}`}
                        value={c.avgConfidence}
                        max={5}
                        suffix={`/5 · ${c.count} attempt${c.count === 1 ? "" : "s"}`}
                    />
                ))}

                {s.topicWise.length > 0 && (
                    <>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mt-3">Progress by Topic</h3>
                        {s.topicWise.map((t) => (
                            <StatBar key={t.folderId} label={t.folderName || t.folderId} value={t.completed} max={Math.max(1, t.total)} suffix=" completed" />
                        ))}
                    </>
                )}

                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mt-3">Weekly Revision Activity</h3>
                {s.weeklyActivity.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">No data yet.</p>
                ) : (
                    s.weeklyActivity.map((w) => <StatBar key={w.weekStart} label={formatDateShort(w.weekStart)} value={w.attempts} max={maxWeek} suffix=" revisions completed" />)
                )}
            </div>
        </section>
    );
}
