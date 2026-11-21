import { RevisionAttempt, RevisionRecord, RevisionSchedule } from "@repo/database/db";
import type { Request, Response } from "express";

import { getCurrentUser } from "./currentUser.js";
import { toRevisionAttemptType, toRevisionRecordType, toRevisionScheduleType } from "./serialize.js";

export const getRevisionDetails = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }

        const record = await RevisionRecord.findOne({ _id: req.params.id, userId: user._id });
        if (!record) {
            return res.status(404).json({ success: false, error: "Revision not found" });
        }

        const schedules = await RevisionSchedule.find({ revisionRecordId: record._id }).sort({ revisionNumber: 1 });
        const scheduleIds = schedules.map((s) => s._id);
        const attempts = scheduleIds.length
            ? await RevisionAttempt.find({ revisionScheduleId: { $in: scheduleIds } })
            : [];

        const attemptsBySchedule = new Map<string, RevisionAttempt[]>();
        for (const attempt of attempts) {
            const key = attempt.revisionScheduleId.toString();
            attemptsBySchedule.set(key, [...(attemptsBySchedule.get(key) ?? []), attempt]);
        }

        return res.status(200).json({
            success: true,
            record: toRevisionRecordType(record),
            schedules: schedules.map((s) => ({
                ...toRevisionScheduleType(s),
                attempts: (attemptsBySchedule.get(s._id.toString()) ?? []).map(toRevisionAttemptType)
            }))
        });
    } catch (error) {
        console.log("Error in getRevisionDetails:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
