import { useRecoilValue } from "recoil";
import { CheckCheck } from "lucide-react";
import { capitalize, cardBaseClass, difficultyClass, formatDate, matchesFilters, pillClass } from "../../../api/revisionUtils";
import { revisionCompletedState } from "../../../recoilstates/revision/revisionState";
import SectionHeader from "./SectionHeader";

interface Props {
    search: string;
    difficultyFilter: string;
}

const METHOD_LABELS: Record<string, string> = {
    independent: "Solved Independently",
    hints: "With Hints",
    solution: "Needed Solution",
    could_not_solve: "Could Not Solve"
};

export default function CompletedRevisions({ search, difficultyFilter }: Props) {
    const schedules = useRecoilValue(revisionCompletedState);
    const items = schedules.filter((s) => matchesFilters(s, search, difficultyFilter));

    return (
        <section className="mb-6">
            <SectionHeader icon={CheckCheck} title="Completed Revision" count={items.length} />
            {items.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-6">No completed revisions.</div>
            ) : (
                <div className="space-y-2">
                    {items.map((s) => {
                        const record = s.record;
                        if (!record) return null;
                        const latest = s.attempts[s.attempts.length - 1];
                        return (
                            <div key={s.id} className={cardBaseClass}>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{record.questionTitle}</p>
                                            {record.platform && <span className={pillClass("blue")}>{record.platform}</span>}
                                            <span className={difficultyClass(record.difficulty) + " text-[11px] font-bold px-3 py-[2px] rounded-full"}>{capitalize(record.difficulty ?? "unknown")}</span>
                                            <span className={pillClass("gray")}>{record.folderName || record.folderId}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                            Revision #{s.revisionNumber} · Original solve: {formatDate(record.originalSolvedAt)} · Scheduled: {formatDate(s.scheduledDate)} · Completed: {formatDate(s.completedAt)}
                                        </div>
                                        {latest && (
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                                {METHOD_LABELS[latest.solvingMethod] ?? latest.solvingMethod} · Confidence {latest.confidenceRating}/5
                                                {latest.timeTaken ? ` · Time: ${latest.timeTaken} min` : ""}
                                            </p>
                                        )}
                                        {latest?.notes && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 italic">"{latest.notes}"</p>}
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
