import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getRevisionByStatus, getRevisionStats, getRevisions, getRevisionsDue } from "../../api/revisionApi";
import {
    revisionCompletedState,
    revisionDueState,
    revisionOverdueState,
    revisionRecordsState,
    revisionStatsState,
    revisionTodayState,
    revisionUpcomingState
} from "../../recoilstates/revision/revisionState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import RevisionAddModal from "./revision/RevisionAddModal";
import RevisionOverviewCards from "./revision/RevisionOverviewCards";
import TodayRevisions from "./revision/TodayRevisions";
import UpcomingRevisions from "./revision/UpcomingRevisions";
import OverdueRevisions from "./revision/OverdueRevisions";
import CompletedRevisions from "./revision/CompletedRevisions";
import RevisionNotifications from "./revision/RevisionNotifications";
import RevisionCalendar from "./revision/RevisionCalendar";
import RevisionAnalytics from "./revision/RevisionAnalytics";

import ReviseModal from "./revision/ReviseModal";
import SnoozeModal from "./revision/SnoozeModal";

function RevisionTrackerPage() {
    const setRecords = useSetRecoilState(revisionRecordsState);
    const setDue = useSetRecoilState(revisionDueState);
    const setStats = useSetRecoilState(revisionStatsState);
    const setToday = useSetRecoilState(revisionTodayState);
    const setUpcoming = useSetRecoilState(revisionUpcomingState);
    const setOverdue = useSetRecoilState(revisionOverdueState);
    const setCompleted = useSetRecoilState(revisionCompletedState);

    const [search, setSearch] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
    const [loading, setLoading] = useState(true);
    const [addModalOpen, setAddModalOpen] = useState(false);

    const loadAll = useCallback(async () => {
        try {
            const [recs, today, upcoming, overdue, completed, stats, due] = await Promise.all([
                getRevisions("all"),
                getRevisionByStatus("today"),
                getRevisionByStatus("upcoming"),
                getRevisionByStatus("overdue"),
                getRevisionByStatus("completed"),
                getRevisionStats(),
                getRevisionsDue()
            ]);
            setRecords(recs.records);
            setToday(today.schedules ?? []);
            setUpcoming(upcoming.schedules ?? []);
            setOverdue(overdue.schedules ?? []);
            setCompleted(completed.schedules ?? []);
            setStats(stats);
            setDue(due.due ?? []);
            if (due.due && due.due.length > 0) {
                toast.info(`You have ${due.due.length} revision(s) due today.`);
            }
        } catch {
            toast.error("Failed to load the revision tracker");
        } finally {
            setLoading(false);
        }
    }, [setRecords, setStats, setToday, setUpcoming, setOverdue, setCompleted]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const today = useRecoilValue(revisionTodayState);
    const upcoming = useRecoilValue(revisionUpcomingState);
    const overdue = useRecoilValue(revisionOverdueState);
    const completed = useRecoilValue(revisionCompletedState);

    const allSchedules = useMemo(() => [...today, ...upcoming, ...overdue, ...completed], [today, upcoming, overdue, completed]);

    if (loading) {
        return (
            <div className="min-h-full bg-slate-50 dark:bg-[#080c14] pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-2">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-slate-50 dark:bg-[#080c14] pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-2">
                <header>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Revision Tracker</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Spaced-repetition revision schedule for your DSA questions</p>
                </header>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search revision questions…"
                        className="flex-1 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-blue-400"
                    />
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value as "all" | "easy" | "medium" | "hard")}
                        className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-400"
                    >
                        <option value="all">All difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="sm:w-40 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                        Add Question
                    </button>
                </div>

                <RevisionOverviewCards />
                <RevisionNotifications />
                <TodayRevisions search={search} difficultyFilter={difficultyFilter} />
                <UpcomingRevisions search={search} difficultyFilter={difficultyFilter} />
                <OverdueRevisions search={search} difficultyFilter={difficultyFilter} />
                <CompletedRevisions search={search} difficultyFilter={difficultyFilter} />
                <RevisionCalendar schedules={allSchedules} />
                <RevisionAnalytics />
            </div>

            {addModalOpen && <RevisionAddModal onClose={() => setAddModalOpen(false)} onReload={loadAll} />}
            <ReviseModal onReload={loadAll} />
            <SnoozeModal onReload={loadAll} />
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-[#0f172a] border dark:border-white/[0.06] rounded-xl px-5 py-4 shadow-sm animate-pulse">
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-white/[0.06] rounded" />
            <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/[0.04] rounded mt-2.5" />
            <div className="h-3 w-2/5 bg-gray-100 dark:bg-white/[0.04] rounded mt-1.5" />
            <div className="h-8 w-2/5 bg-gray-100 dark:bg-white/[0.04] rounded mt-4" />
        </div>
    );
}

export default RevisionTrackerPage;
