import type { basicResponseType } from "./basicResponseType.ts";

export interface revisionStatsType extends basicResponseType {
    totalRevised: number;
    dueTodayCount: number;
    upcomingCount: number;
    overdueCount: number;
    completedCount: number;
    completionPercentage: number;
    byRevision: Array<{
        revisionNumber: number;
        intervalDays: number;
        total: number;
        completed: number;
        dueToday: number;
        overdue: number;
        upcoming: number;
    }>;
    topicWise: Array<{ folderId: string; folderName: string | null; total: number; completed: number }>;
    difficultyWise: Array<{ difficulty: string; total: number; completed: number }>;
    confidenceImprovement: Array<{ revisionNumber: number; avgConfidence: number; count: number }>;
    weeklyActivity: Array<{ weekStart: string; attempts: number }>;
}
