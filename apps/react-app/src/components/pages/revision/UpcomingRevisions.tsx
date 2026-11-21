import { useRecoilValue } from "recoil";
import { Sunrise } from "lucide-react";
import { capitalize, cardBaseClass, difficultyClass, formatDate, matchesFilters, pillClass, upcomingBucket } from "../../../api/revisionUtils";
import { revisionUpcomingState } from "../../../recoilstates/revision/revisionState";
import SectionHeader from "./SectionHeader";
import type { revisionStatusResponseType } from "@repo/types/apiResponse/revisionStatusResponseType";

type Bucket = "tomorrow" | "next7" | "next15" | "next30";

const BUCKET_LABEL: Record<Bucket, string> = {
    tomorrow: "Tomorrow",
    next7: "Next 7 Days",
    next15: "Next 15 Days",
    next30: "Next 30 Days"
};

interface Props {
    search: string;
    difficultyFilter: string;
}

export default function UpcomingRevisions({ search, difficultyFilter }: Props) {
    const schedules = useRecoilValue(revisionUpcomingState);

    const buckets: Record<Bucket, revisionStatusResponseType["schedules"]> = {
        tomorrow: [],
        next7: [],
        next15: [],
        next30: []
    };
    for (const s of schedules) {
        const bucket = upcomingBucket(s.scheduledDate);
        if (!bucket) continue;
        buckets[bucket].push(s);
    }

    const filtered = (items: typeof schedules) => items.filter((s) => matchesFilters(s, search, difficultyFilter));
    const anyVisible = (["tomorrow", "next7", "next15", "next30"] as Bucket[]).some((b) => filtered(buckets[b]).length > 0);

    return (
        <section className="mb-6">
            <SectionHeader icon={Sunrise} title="Upcoming Revision" count={schedules.length} />
            {!anyVisible ? (
                <div className="text-gray-400 text-sm text-center py-6">No upcoming revisions.</div>
            ) : (
                <div className="space-y-4">
                    {(["tomorrow", "next7", "next15", "next30"] as Bucket[]).map((bucket) => {
                        const items = filtered(buckets[bucket]);
                        if (items.length === 0) return null;
                        return (
                            <div key={bucket}>
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                                    {BUCKET_LABEL[bucket]} ({items.length})
                                </h3>
                                <div className="space-y-2">
                                    {items.map((s) => {
                                        if (!s.record) return null;
                                        const record = s.record;
                                        return (
                                            <div key={s.id} className={cardBaseClass}>
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{record.questionTitle}</p>
                                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                            {record.platform && <span className={pillClass("blue")}>{record.platform}</span>}
                                                            <span className={difficultyClass(record.difficulty) + " text-[11px] font-bold px-3 py-[2px] rounded-full"}>{capitalize(record.difficulty ?? "unknown")}</span>
                                                            <span className={pillClass("gray")}>{record.folderName || record.folderId || "-"}</span>
                                                        </div>
                                                        <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                            Revision #{s.revisionNumber} · Original solve: {formatDate(record.originalSolvedAt)} · Scheduled: {formatDate(s.scheduledDate)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
