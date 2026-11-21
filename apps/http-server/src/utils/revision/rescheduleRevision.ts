import { RevisionRecord, RevisionSchedule } from "@repo/database/db";
import type { rescheduleRevisionRequestType } from "@repo/types/apiRequests/rescheduleRevisionRequestType";
import type { Request, Response } from "express";

import { getCurrentUser } from "./currentUser.js";
import { toRevisionScheduleType } from "./serialize.js";

export const rescheduleRevision = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }

        const { id, scheduleId } = req.params;
        const { scheduledDate }: rescheduleRevisionRequestType = req.body ?? {};
        if (!scheduledDate) {
            return res.status(400).json({ success: false, error: "scheduledDate is required" });
        }
        const newDate = new Date(scheduledDate);
        if (isNaN(newDate.getTime())) {
            return res.status(400).json({ success: false, error: "Invalid scheduledDate" });
        }

        const record = await RevisionRecord.findOne({ _id: id, userId: user._id });
        if (!record) {
            return res.status(404).json({ success: false, error: "Revision not found" });
        }
        const schedule = await RevisionSchedule.findOne({ _id: scheduleId, revisionRecordId: record._id });
        if (!schedule) {
            return res.status(404).json({ success: false, error: "Schedule not found" });
        }
        if (schedule.status !== "pending") {
            return res.status(409).json({ success: false, error: "Cannot reschedule a completed revision" });
        }

        schedule.rescheduledFrom = schedule.scheduledDate;
        schedule.scheduledDate = newDate;
        await schedule.save();

        return res.status(200).json({ success: true, schedule: toRevisionScheduleType(schedule) });
    } catch (error) {
        console.log("Error in rescheduleRevision:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
