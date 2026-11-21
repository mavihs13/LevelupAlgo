import { RevisionRecord, RevisionSchedule } from "@repo/database/db";
import type { Request, Response } from "express";

import { getCurrentUser } from "./currentUser.js";
import { toRevisionRecordType } from "./serialize.js";

export const getRevisions = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }

        const status = req.query.status as string | undefined;
        const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit ?? "20"), 10) || 20));
        const sortBy = req.query.sortBy as string | undefined;

        const filter: Record<string, unknown> = { userId: user._id };
        if (status && status !== "all") {
            filter.status = status;
        }

        let records;
        let total;

        if (sortBy === "scheduledDate") {
            // Sort by the earliest schedule date; fall back to originalSolvedAt
            const all = await RevisionRecord.find(filter as any);
            // Prefer pending schedules: completed ones usually carry older dates
            const schedules = await RevisionSchedule.find({
                revisionRecordId: { $in: all.map((r) => r._id) },
                status: "pending"
            });
            const minByRecord = new Map<string, Date>();
            for (const s of schedules) {
                const key = s.revisionRecordId.toString();
                const cur = minByRecord.get(key);
                if (!cur || s.scheduledDate.getTime() < cur.getTime()) {
                    minByRecord.set(key, s.scheduledDate);
                }
            }
            records = all.slice().sort((a, b) => {
                const ka = minByRecord.get(a._id.toString())?.getTime() ?? a.originalSolvedAt?.getTime() ?? 0;
                const kb = minByRecord.get(b._id.toString())?.getTime() ?? b.originalSolvedAt?.getTime() ?? 0;
                return kb - ka; // newest first
            });
            total = records.length;
            records = records.slice((page - 1) * limit, (page - 1) * limit + limit);
        } else {
            total = await RevisionRecord.countDocuments(filter as any);
            records = await RevisionRecord.find(filter as any)
                .sort({ originalSolvedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
        }

        const totalPages = Math.max(1, Math.ceil(total / limit));
        return res.status(200).json({
            success: true,
            records: records.map(toRevisionRecordType),
            total,
            page,
            totalPages
        });
    } catch (error) {
        console.log("Error in getRevisions:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
