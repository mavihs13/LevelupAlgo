import { useRecoilValue } from "recoil";
import { TrendingUp } from "lucide-react";
import { revisionStatsState } from "../../../recoilstates/revision/revisionState";
import SectionHeader from "./SectionHeader";

interface StatCardProps {
    title: string;
    value: string;
    note?: string;
}

function StatCard({ title, value, note }: StatCardProps) {
    return (
        <div className="bg-white dark:bg-[#0f172a] border dark:border-white/[0.06] rounded-xl px-4 py-3.5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</p>
            <p className="text-xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
            {note && <p className="text-xs mt-0.5 text-gray-400 dark:text-gray-500">{note}</p>}
        </div>
    );
}

export default function RevisionOverviewCards() {
    const stats = useRecoilValue(revisionStatsState);
    if (!stats) return null;
    const s = stats;
    return (
        <section className="mb-6">
            <SectionHeader icon={TrendingUp} title="Overview" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard title="Total revised" value={String(s.totalRevised)} />
                <StatCard title="Due today" value={String(s.dueTodayCount)} />
                <StatCard title="Upcoming" value={String(s.upcomingCount)} />
                <StatCard title="Overdue" value={String(s.overdueCount)} />
                <StatCard title="Completed" value={String(s.completedCount)} />
                <StatCard title="Completion %" value={`${s.completionPercentage}%`} />
            </div>
        </section>
    );
}
