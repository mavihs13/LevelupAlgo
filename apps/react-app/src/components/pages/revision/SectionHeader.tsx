import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
    icon: LucideIcon;
    title: string;
    count?: number;
    right?: ReactNode;
}

/** Shared section header: colored icon + title + optional count and right-side actions. */
export default function SectionHeader({ icon: Icon, title, count, right }: Props) {
    return (
        <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                <Icon size={14} className="text-blue-500" />
                {title}
                {count !== undefined && <span className="text-gray-400">({count})</span>}
            </h2>
            {right && <div className="flex items-center gap-2">{right}</div>}
        </div>
    );
}
