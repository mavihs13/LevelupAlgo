import { useRecoilValue, useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { ListChecks } from "lucide-react";
import { toast } from "react-toastify";
import { actionButtonClass, capitalize, cardBaseClass, difficultyClass, formatDate, matchesFilters, pillClass } from "../../../api/revisionUtils";
import { revisionReviseState, revisionSnoozeState, revisionTodayState } from "../../../recoilstates/revision/revisionState";
import SectionHeader from "./SectionHeader";
import type { revisionRecordType } from "@repo/types/apiResponse/revisionRecordType";

interface Props {
    search: string;
    difficultyFilter: string;
}

export default function TodayRevisions({ search, difficultyFilter }: Props) {
    const navigate = useNavigate();
    const schedules = useRecoilValue(revisionTodayState);
    const setRevise = useSetRecoilState(revisionReviseState);
    const setSnooze = useSetRecoilState(revisionSnoozeState);

    const items = schedules.filter((s) => matchesFilters(s, search, difficultyFilter));

    const openQuestion = (record: revisionRecordType) => {
        if (!record.sheetId) {
            toast.warn("This question is not linked to a sheet.");
            return;
        }
        navigate(`/sheet/${record.sheetId}`);
    };

    const viewSolution = (record: revisionRecordType) => {
        if (record.questionLink) {
            window.open(record.questionLink, "_blank", "noopener");
        } else {
            toast.info("No external link available for this question.");
        }
    };

    return (
        <section className="mb-6">
            <SectionHeader icon={ListChecks} title="Today's Revision" count={items.length} />
            {items.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-6">No revisions due today.</div>
            ) : (
                <div className="space-y-2">
                    {items.map((s) => {
                        const record = s.record;
                        if (!record) return null;
                        const successful = s.attempts.filter((a) => a.solvingMethod === "independent").length;
                        return (
                            <div key={s.id} className={`${cardBaseClass} border-l-2 border-l-indigo-300 dark:border-l-indigo-600`}>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{record.questionTitle}</p>
                                            {record.platform && <span className={pillClass("blue")}>{record.platform}</span>}
                                            <span className={difficultyClass(record.difficulty) + " text-[11px] font-bold px-3 py-[2px] rounded-full"}>{capitalize(record.difficulty ?? "unknown")}</span>
                                            <span className={pillClass("gray")}>{record.folderName || record.folderId}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                            <span>Revision #{s.revisionNumber}</span>
                                            <span>· Original solve: {formatDate(record.originalSolvedAt)}</span>
                                            <span>· Scheduled: {formatDate(s.scheduledDate)}</span>
                                            {s.attempts.length > 0 && <span>· Previous successful revisions: {successful}</span>}
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button onClick={() => openQuestion(record)} className={actionButtonClass("blue")}>Open Question</button>
                                            <button onClick={() => setRevise({ record, schedule: s })} className={actionButtonClass("emerald")}>Mark as Revised</button>
                                            <button onClick={() => viewSolution(record)} className={actionButtonClass("blue")}>View Solution</button>
                                            <button onClick={() => setSnooze({ record, schedule: s })} className={actionButtonClass("blue")}>Snooze / Reschedule</button>
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
