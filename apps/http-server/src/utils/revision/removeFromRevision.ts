import { RevisionAttempt, RevisionRecord, RevisionSchedule } from "@repo/database/db";
import type { Request, Response } from "express";

import { getCurrentUser } from "./currentUser.js";

export const removeFromRevision = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }
        const record = await RevisionRecord.findOne({ _id: req.params.id, userId: user._id });
        if (!record) {
            return res.status(404).json({ success: false, error: "Revision not found" });
        }

        // Delete tracking records; the Question itself (done status etc.) is never touched
        const schedules = await RevisionSchedule.find({ revisionRecordId: record._id });
        const scheduleIds = schedules.map((s) => s._id);
        if (scheduleIds.length) {
            await RevisionAttempt.deleteMany({ revisionScheduleId: { $in: scheduleIds } });
        }
        await RevisionSchedule.deleteMany({ revisionRecordId: record._id });
        await record.deleteOne();

        return res.status(200).json({ success: true, message: "Removed from revision tracker" });
    } catch (error) {
        console.log("Error in removeFromRevision:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
