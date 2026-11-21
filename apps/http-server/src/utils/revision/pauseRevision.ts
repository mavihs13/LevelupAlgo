import { RevisionRecord } from "@repo/database/db";
import type { Request, Response } from "express";

import { getCurrentUser } from "./currentUser.js";
import { toRevisionRecordType } from "./serialize.js";

export const pauseRevision = async (req: Request, res: Response) => {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return res.status(401).json({ success: false, error: "User not authenticated" });
        }
        const record = await RevisionRecord.findOne({ _id: req.params.id, userId: user._id });
        if (!record) {
            return res.status(404).json({ success: false, error: "Revision not found" });
        }
        record.status = "paused";
        await record.save();
        return res.status(200).json({ success: true, record: toRevisionRecordType(record) });
    } catch (error) {
        console.log("Error in pauseRevision:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
