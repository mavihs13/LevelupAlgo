import { useRecoilValue } from "recoil";
import { Bell } from "lucide-react";
import { capitalize, cardBaseClass, difficultyClass, formatDate, pillClass } from "../../../api/revisionUtils";
import { revisionDueState } from "../../../recoilstates/revision/revisionState";
import SectionHeader from "./SectionHeader";

/** Per-question notifications: revision dates due today, one card per question. */
export default function RevisionNotifications() {
    const due = useRecoilValue(revisionDueState);

    return (
        <section className="mb-6">
            <SectionHeader icon={Bell} title="Notifications" count={due.length} />
            {due.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-6">No revision notifications due today.</div>
            ) : (
                <div className="space-y-2">
                    {due.map((s) => {
                        if (!s.record) return null;
                        const record = s.record;
                        return (
                            <div key={s.id} className={`${cardBaseClass} border-violet-200 dark:border-violet-900/30 bg-violet-50/40 dark:bg-violet-900/10`}>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{record.questionTitle}</p>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                            {record.platform && <span className={pillClass("blue")}>{record.platform}</span>}
                                            <span className={difficultyClass(record.difficulty) + " text-[11px] font-bold px-3 py-[2px] rounded-full"}>{capitalize(record.difficulty ?? "unknown")}</span>
                                            <span className={pillClass("gray")}>{record.folderName || record.folderId}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                            Revision #{s.revisionNumber} due today (scheduled: {formatDate(s.scheduledDate)}).
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
