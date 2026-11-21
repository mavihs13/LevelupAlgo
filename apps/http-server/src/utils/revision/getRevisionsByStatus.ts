import { RevisionAttempt, RevisionRecord, RevisionSchedule } from "@repo/database/db";
import type { Request, Response } from "express";

import { dayKey } from "./computeSchedules.js";
import { getCurrentUser } from "./currentUser.js";
import { toRevisionAttemptType, toRevisionRecordType, toRevisionScheduleType } from "./serialize.js";

type StatusFilter = "today" | "upcoming" | "overdue" | "completed";

export function getRevisionsByStatus(status: StatusFilter) {
    return async (req: Request, res: Response) => {
        try {
            const user = await getCurrentUser(req);
            if (!user) {
                return res.status(401).json({ success: false, error: "User not authenticated" });
            }

            const todayKey = dayKey(new Date());
            const allRecords = await RevisionRecord.find({ userId: user._id });
            // Paused records don't show as due today/upcoming/overdue
            const records = allRecords.filter((r) => status === "completed" || r.status === "active");
            const recordIds = records.map((r) => r._id);
            const schedules = await RevisionSchedule.find({
                revisionRecordId: { $in: recordIds },
                status: status === "completed" ? "completed" : "pending"
            });

            const recordMap = new Map(records.map((r) => [r._id.toString(), r]));
            const enriched = schedules
                .filter((s) => {
                    if (status === "completed") return true;
                    const key = dayKey(s.scheduledDate);
                    if (status === "today") return key === todayKey;
                    if (status === "overdue") return key < todayKey;
                    return key > todayKey; // upcoming
                })
                .map((s) => ({ schedule: s, record: recordMap.get(s.revisionRecordId.toString()) }));

            const attemptsBySchedule = new Map<string, RevisionAttempt[]>();
            const attemptsList = await RevisionAttempt.find({
                revisionScheduleId: { $in: schedules.map((s) => s._id) }
            });
            for (const a of attemptsList) {
                const key = a.revisionScheduleId.toString();
                attemptsBySchedule.set(key, [...(attemptsBySchedule.get(key) ?? []), a]);
            }

            return res.status(200).json({
                success: true,
                status,
                schedules: enriched.map(({ schedule, record }) => {
                    const sched = toRevisionScheduleType(schedule);
                    return {
                        ...sched,
                        record: record ? toRevisionRecordType(record) : null,
                        attempts: (attemptsBySchedule.get(sched.id) ?? []).map(toRevisionAttemptType)
                    };
                })
            });
        } catch (error) {
            console.log("Error in getRevisionsByStatus:", error);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    };
}
