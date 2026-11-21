import { Folders, Question, RevisionRecord, RevisionSchedule } from "@repo/database/db";
import type { addToRevisionRequestType } from "@repo/types/apiRequests/addToRevisionRequestType";
import type { Request, Response } from "express";

import { computeSchedules } from "./computeSchedules.js";
import { getCurrentUser } from "./currentUser.js";
import { toRevisionRecordType, toRevisionScheduleType } from "./serialize.js";

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Resolve the question to add: by id, exact title match, then case-insensitive
 * title contains. If no name matched, falls back to a case-insensitive link match.
 */
async function resolveQuestion(body: addToRevisionRequestType) {
    if (body.questionId) {
        return Question.findById(body.questionId);
    }
    const name = body.questionName?.trim() ?? "";
    const link = body.questionLink?.trim() ?? "";
    if (!name && !link) return null;
    if (name) {
        const byTitle = await Question.findOne({ title: name }).sort({ title: 1 });
        if (byTitle) return byTitle;
        const byTitleCi = await Question.findOne({ title: new RegExp(escapeRegex(name), "i") }).sort({ title: 1 });
        if (byTitleCi) return byTitleCi;
    }
    if (link) {
        const byLink = await Question.findOne({ link: new RegExp(escapeRegex(link), "i") }).sort({ link: 1 });
        if (byLink) return byLink;
    }
    return null;
}

export const addToRevision = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated", redirect: "/login" });
        }

        const { originalSolvedAt, legacyStatus }: addToRevisionRequestType = req.body ?? {};
        if (!req.body?.questionId && !req.body?.questionName && !req.body?.questionLink) {
            return res.status(400).json({ success: false, error: "questionId, questionName or questionLink is required" });
        }

        const question = await resolveQuestion(req.body ?? {});
        if (!question) {
            return res.status(404).json({ success: false, error: "Question not found — check the name or link" });
        }

        // Duplicate prevention (unique index backstops this)
        const existing = await RevisionRecord.findOne({ userId: user._id, questionId: question._id });
        if (existing) {
            const schedules = await RevisionSchedule.find({ revisionRecordId: existing._id }).sort({ revisionNumber: 1 });
            return res.status(200).json({
                success: true,
                message: "Question is already in your revision tracker",
                record: toRevisionRecordType(existing),
                schedules: schedules.map(toRevisionScheduleType)
            });
        }

        let solvedAt: Date;
        if (originalSolvedAt) {
            solvedAt = new Date(originalSolvedAt);
            if (isNaN(solvedAt.getTime())) {
                return res.status(400).json({ success: false, error: "Invalid originalSolvedAt date" });
            }
        } else {
            solvedAt = question.solvedAt ?? new Date();
        }

        const folderName = question.folderId ? ((await Folders.findById(question.folderId))?.name ?? null) : null;
        const record = new RevisionRecord({
            userId: user._id,
            questionId: question._id,
            questionTitle: question.title,
            platform: question.platform ?? null,
            difficulty: question.difficulty ?? null,
            folderId: question.folderId?.toString() ?? null,
            folderName,
            sheetId: question.sheetId?.toString() ?? null,
            questionLink: question.link ?? null,
            originalSolvedAt: solvedAt,
            status: "active",
            legacyStatus: legacyStatus ?? null
        });
        await record.save();

        await RevisionSchedule.insertMany(computeSchedules(record.originalSolvedAt).map((s) => ({ ...s, revisionRecordId: record._id })));

        const schedules = await RevisionSchedule.find({ revisionRecordId: record._id }).sort({ revisionNumber: 1 });
        return res.status(201).json({
            success: true,
            message: "Added to revision tracker",
            record: toRevisionRecordType(record),
            schedules: schedules.map(toRevisionScheduleType)
        });
    } catch (error) {
        console.log("Error in addToRevision:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
