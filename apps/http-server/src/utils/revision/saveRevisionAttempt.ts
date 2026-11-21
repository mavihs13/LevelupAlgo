import { RevisionAttempt, RevisionRecord, RevisionSchedule } from "@repo/database/db";
import type { saveRevisionAttemptRequestType } from "@repo/types/apiRequests/saveRevisionAttemptRequestType";
import type { solvingMethodType } from "@repo/types/apiResponse/revisionAttemptType";
import type { Request, Response } from "express";

import { getCurrentUser } from "./currentUser.js";
import { SOLVING_METHODS, toRevisionAttemptType } from "./serialize.js";

export const saveRevisionAttempt = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }

        const { scheduleId, confidenceRating, solvingMethod, timeTaken, notes }: saveRevisionAttemptRequestType = req.body;
        if (!scheduleId) {
            return res.status(400).json({ success: false, error: "scheduleId is required" });
        }

        const record = await RevisionRecord.findOne({ _id: req.params.id, userId: user._id });
        if (!record) {
            return res.status(404).json({ success: false, error: "Revision not found" });
        }
        const schedule = await RevisionSchedule.findOne({ _id: scheduleId, revisionRecordId: record._id });
        if (!schedule) {
            return res.status(404).json({ success: false, error: "Schedule not found" });
        }

        const rating = typeof confidenceRating === "number" ? confidenceRating : 3;
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: "confidenceRating must be an integer between 1 and 5" });
        }
        const method = (solvingMethod as solvingMethodType | undefined) ?? "independent";
        if (!SOLVING_METHODS.includes(method)) {
            return res.status(400).json({ success: false, error: "solvingMethod is invalid" });
        }

        const attempt = new RevisionAttempt({
            revisionScheduleId: schedule._id,
            userId: user._id,
            confidenceRating: rating,
            solvingMethod: method,
            timeTaken: typeof timeTaken === "number" ? timeTaken : null,
            notes: typeof notes === "string" ? notes : ""
        });
        await attempt.save();

        return res.status(201).json({ success: true, attempt: toRevisionAttemptType(attempt) });
    } catch (error) {
        console.log("Error in saveRevisionAttempt:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
