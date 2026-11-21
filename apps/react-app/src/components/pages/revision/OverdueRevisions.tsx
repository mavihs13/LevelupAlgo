import { useRecoilValue, useSetRecoilState } from "recoil";
import { AlertCircle } from "lucide-react";
import { capitalize, cardBaseClass, dayKey, daysBetweenKeys, difficultyClass, formatDate, matchesFilters, pillClass, todayKey } from "../../../api/revisionUtils";
import { revisionOverdueState, revisionReviseState, revisionSnoozeState } from "../../../recoilstates/revision/revisionState";
import SectionHeader from "./SectionHeader";

interface Props {
    search: string;
    difficultyFilter: string;
}

export default function OverdueRevisions({ search, difficultyFilter }: Props) {
    const schedules = useRecoilValue(revisionOverdueState);
    const setRevise = useSetRecoilState(revisionReviseState);
    const setSnooze = useSetRecoilState(revisionSnoozeState);

    const items = schedules.filter((s) => matchesFilters(s, search, difficultyFilter));
    const today = todayKey();

    return (
        <section className="mb-6">
            <SectionHeader icon={AlertCircle} title="Overdue Revision" count={items.length} />
            {items.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-6">No overdue revisions.</div>
            ) : (
                <div className="space-y-2">
                    {items.map((s) => {
                        const record = s.record;
                        if (!record) return null;
                        const overdueDays = daysBetweenKeys(today, dayKey(s.scheduledDate));
                        return (
                            <div key={s.id} className={`${cardBaseClass} border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10`}>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{record.questionTitle}</p>
                                            {record.platform && <span className={pillClass("blue")}>{record.platform}</span>}
                                            <span className={difficultyClass(record.difficulty) + " text-[11px] font-bold px-3 py-[2px] rounded-full"}>{capitalize(record.difficulty ?? "unknown")}</span>
                                            <span className={pillClass("gray")}>{record.folderName || record.folderId}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                                                {overdueDays} {overdueDays === 1 ? "day" : "days"} overdue
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            Revision #{s.revisionNumber} · Original solve: {formatDate(record.originalSolvedAt)} · Due: {formatDate(s.scheduledDate)}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setRevise({ record, schedule: s })}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1 rounded-full text-[12px] font-semibold transition-colors"
                                            >
                                                Revise Now
                                            </button>
                                            <button
                                                onClick={() => setSnooze({ record, schedule: s })}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1 rounded-full text-[12px] font-semibold transition-colors"
                                            >
                                                Reschedule
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
