import { RevisionRecord, RevisionSchedule } from "@repo/database/db";
import type { updateOriginalSolvedAtRequestType } from "@repo/types/apiRequests/updateOriginalSolvedAtRequestType";
import type { Request, Response } from "express";

import { regeneratePendingSchedules } from "./computeSchedules.js";
import { getCurrentUser } from "./currentUser.js";
import { toRevisionRecordType, toRevisionScheduleType } from "./serialize.js";

export const updateOriginalSolvedAt = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }

        const { originalSolvedAt }: updateOriginalSolvedAtRequestType = req.body ?? {};
        if (!originalSolvedAt) {
            return res.status(400).json({ success: false, error: "originalSolvedAt is required" });
        }
        const newSolvedAt = new Date(originalSolvedAt);
        if (isNaN(newSolvedAt.getTime())) {
            return res.status(400).json({ success: false, error: "Invalid originalSolvedAt" });
        }

        const record = await RevisionRecord.findOne({ _id: req.params.id, userId: user._id });
        if (!record) {
            return res.status(404).json({ success: false, error: "Revision not found" });
        }

        record.originalSolvedAt = newSolvedAt;
        const schedules = await RevisionSchedule.find({ revisionRecordId: record._id });
        regeneratePendingSchedules(newSolvedAt, schedules);
        for (const s of schedules) {
            if (s.isModified()) await s.save();
        }
        await record.save();

        return res.status(200).json({
            success: true,
            record: toRevisionRecordType(record),
            schedules: schedules.map(toRevisionScheduleType)
        });
    } catch (error) {
        console.log("Error in updateOriginalSolvedAt:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
