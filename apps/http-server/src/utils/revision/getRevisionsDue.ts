import { RevisionRecord, RevisionSchedule } from "@repo/database/db";
import { dayKey } from "./computeSchedules.js";
import { getCurrentUser } from "./currentUser.js";
import { toRevisionRecordType, toRevisionScheduleType } from "./serialize.js";
import type { Request, Response } from "express";
import type { revisionDueItemType, revisionDueResponseType } from "@repo/types/apiResponse/revisionDueResponseType";

/** Schedules due today (active + pending, dayKey == today). */
export const getRevisionsDue = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }

        const todayKey = dayKey(new Date());
        const records = await RevisionRecord.find({ userId: user._id, status: "active" });
        const schedules = await RevisionSchedule.find({
            revisionRecordId: { $in: records.map((r) => r._id) },
            status: "pending"
        });

        const recordMap = new Map(records.map((r) => [r._id.toString(), r]));
        const due: revisionDueItemType[] = schedules
            .filter((s) => dayKey(s.scheduledDate) === todayKey)
            .map((s) => {
                const record = recordMap.get(s.revisionRecordId.toString()) ?? null;
                return { ...toRevisionScheduleType(s), record: record ? toRevisionRecordType(record) : null };
            });

        const response: revisionDueResponseType = { success: true, due };
        return res.status(200).json(response);
    } catch (error) {
        console.log("Error in getRevisionsDue:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
