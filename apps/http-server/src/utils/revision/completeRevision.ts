import { RevisionAttempt, RevisionRecord, RevisionSchedule } from "@repo/database/db";
import type { completeRevisionRequestType } from "@repo/types/apiRequests/completeRevisionRequestType";
import type { solvingMethodType } from "@repo/types/apiResponse/revisionAttemptType";
import type { Request, Response } from "express";

import { getCurrentUser } from "./currentUser.js";
import { SOLVING_METHODS, toRevisionAttemptType, toRevisionScheduleType } from "./serialize.js";

export const completeRevision = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }

        const { id, scheduleId } = req.params;
        const { confidenceRating, solvingMethod, timeTaken, notes }: completeRevisionRequestType = req.body ?? {};

        const record = await RevisionRecord.findOne({ _id: id, userId: user._id });
        if (!record) {
            return res.status(404).json({ success: false, error: "Revision not found" });
        }
        const schedule = await RevisionSchedule.findOne({ _id: scheduleId, revisionRecordId: record._id });
        if (!schedule) {
            return res.status(404).json({ success: false, error: "Schedule not found" });
        }
        if (schedule.status !== "pending") {
            return res.status(409).json({ success: false, error: "Revision already completed" });
        }

        const rating = typeof confidenceRating === "number" ? confidenceRating : 3;
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: "confidenceRating must be an integer between 1 and 5" });
        }
        const method = (solvingMethod as solvingMethodType | undefined) ?? "independent";
        if (!SOLVING_METHODS.includes(method)) {
            return res.status(400).json({ success: false, error: "solvingMethod is invalid" });
        }

        // Save the attempt, then mark the schedule completed
        const attempt = new RevisionAttempt({
            revisionScheduleId: schedule._id,
            userId: user._id,
            confidenceRating: rating,
            solvingMethod: method,
            timeTaken: typeof timeTaken === "number" ? timeTaken : null,
            notes: typeof notes === "string" ? notes : "",
            completedAt: new Date()
        });
        await attempt.save();

        schedule.status = "completed";
        schedule.completedAt = new Date();
        await schedule.save();

        return res.status(200).json({
            success: true,
            schedule: toRevisionScheduleType(schedule),
            attempt: toRevisionAttemptType(attempt)
        });
    } catch (error) {
        console.log("Error in completeRevision:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
