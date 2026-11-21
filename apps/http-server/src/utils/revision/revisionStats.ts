import { Folders, RevisionAttempt, RevisionRecord, RevisionSchedule } from "@repo/database/db";
import type { ObjectId } from "mongoose";
import type { Request, Response } from "express";

import { REVISION_INTERVALS, addDaysUtc, dayKey, normalizeDay } from "./computeSchedules.js";
import { getCurrentUser } from "./currentUser.js";

function weekKey(d: Date): string {
    const dayStart = normalizeDay(d);
    const diffFromMonday = (dayStart.getUTCDay() + 6) % 7; // 0 = Monday
    return dayKey(addDaysUtc(dayStart, -diffFromMonday));
}

export const revisionStats = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }

        const todayKey = dayKey(new Date());
        const records = await RevisionRecord.find({ userId: user._id });
        const schedules = await RevisionSchedule.find({ revisionRecordId: { $in: records.map((r) => r._id) } });

        const dueToday = schedules.filter((s) => s.status === "pending" && dayKey(s.scheduledDate) === todayKey);
        const upcoming = schedules.filter((s) => s.status === "pending" && dayKey(s.scheduledDate) > todayKey);
        const overdue = schedules.filter((s) => s.status === "pending" && dayKey(s.scheduledDate) < todayKey);
        const completed = schedules.filter((s) => s.status === "completed");

        const totalSchedules = schedules.length;
        const completionPercentage = totalSchedules === 0 ? 0 : Math.round((completed.length / totalSchedules) * 100);

        const byRevision = REVISION_INTERVALS.map((intervalDays, i) => {
            const num = i + 1;
            const rs = schedules.filter((s) => s.revisionNumber === num);
            return {
                revisionNumber: num,
                intervalDays,
                total: rs.length,
                completed: rs.filter((s) => s.status === "completed").length,
                dueToday: rs.filter((s) => s.status === "pending" && dayKey(s.scheduledDate) === todayKey).length,
                overdue: rs.filter((s) => s.status === "pending" && dayKey(s.scheduledDate) < todayKey).length,
                upcoming: rs.filter((s) => s.status === "pending" && dayKey(s.scheduledDate) > todayKey).length
            };
        });

        // Topic-wise progress grouped by folder (resolving names where possible)
        const folderIds = [...new Set(records.map((r) => r.folderId).filter((f): f is string => Boolean(f)))];
        const folderDocs = await Folders.find({ _id: { $in: folderIds } }).lean<Array<{ _id: ObjectId; name?: string }>>();
        const folderNameById = new Map(folderDocs.map((f) => [f._id.toString(), f.name ?? null]));
        const topicWise = folderIds.map((folderId) => {
            const recs = records.filter((r) => r.folderId === folderId);
            const scheds = recs.flatMap((r) => schedules.filter((s) => s.revisionRecordId.toString() === r._id.toString()));
            return {
                folderId,
                folderName: folderNameById.get(folderId) ?? null,
                total: recs.length,
                completed: scheds.filter((s) => s.status === "completed").length
            };
        });

        // Difficulty-wise performance
        const difficultyMap = new Map<string, { total: number; completed: number }>();
        for (const r of records) {
            const d = r.difficulty || "unknown";
            const entry = difficultyMap.get(d) ?? { total: 0, completed: 0 };
            entry.total += 1;
            const scheds = schedules.filter((s) => s.revisionRecordId.toString() === r._id.toString());
            entry.completed += scheds.filter((s) => s.status === "completed").length;
            difficultyMap.set(d, entry);
        }
        const difficultyWise = [...difficultyMap.entries()].map(([difficulty, v]) => ({ difficulty, ...v }));

        // Confidence improvement by revision number (average confidence of completed attempts)
        const revBySchedule = new Map(schedules.map((s) => [s._id.toString(), s.revisionNumber]));
        const attempts = await RevisionAttempt.find({ userId: user._id });
        const confByRev = new Map<number, { sum: number; count: number }>();
        for (const a of attempts) {
            const revNum = revBySchedule.get(a.revisionScheduleId.toString());
            if (revNum === undefined) continue;
            const entry = confByRev.get(revNum) ?? { sum: 0, count: 0 };
            entry.sum += a.confidenceRating;
            entry.count += 1;
            confByRev.set(revNum, entry);
        }
        const confidenceImprovement = [...confByRev.entries()].map(([revisionNumber, v]) => ({
            revisionNumber,
            avgConfidence: Math.round((v.sum / v.count) * 100) / 100,
            count: v.count
        }));

        // Weekly activity of attempts
        const weekly = new Map<string, number>();
        for (const a of attempts) {
            const w = weekKey(a.attemptedAt);
            weekly.set(w, (weekly.get(w) ?? 0) + 1);
        }
        const weeklyActivity = [...weekly.entries()]
            .map(([weekStart, attemptsCount]) => ({ weekStart, attempts: attemptsCount }))
            .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
            .slice(0, 8);

        return res.status(200).json({
            success: true,
            totalRevised: records.length,
            dueTodayCount: dueToday.length,
            upcomingCount: upcoming.length,
            overdueCount: overdue.length,
            completedCount: completed.length,
            completionPercentage,
            byRevision,
            topicWise,
            difficultyWise,
            confidenceImprovement,
            weeklyActivity
        });
    } catch (error) {
        console.log("Error in revisionStats:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
