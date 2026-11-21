import express from "express";

import { addToRevision } from "../utils/revision/addToRevision.js";
import { getRevisions } from "../utils/revision/getRevisions.js";
import { getRevisionsByStatus } from "../utils/revision/getRevisionsByStatus.js";
import { getRevisionsDue } from "../utils/revision/getRevisionsDue.js";
import { getRevisionDetails } from "../utils/revision/getRevisionDetails.js";
import { saveRevisionAttempt } from "../utils/revision/saveRevisionAttempt.js";
import { completeRevision } from "../utils/revision/completeRevision.js";
import { rescheduleRevision } from "../utils/revision/rescheduleRevision.js";
import { updateOriginalSolvedAt } from "../utils/revision/updateOriginalSolvedAt.js";
import { pauseRevision } from "../utils/revision/pauseRevision.js";
import { resumeRevision } from "../utils/revision/resumeRevision.js";
import { removeFromRevision } from "../utils/revision/removeFromRevision.js";
import { revisionStats } from "../utils/revision/revisionStats.js";

const RevisionRouter = express.Router();

RevisionRouter.post("/", addToRevision);
RevisionRouter.get("/", getRevisions);

RevisionRouter.get("/today", getRevisionsByStatus("today"));
RevisionRouter.get("/upcoming", getRevisionsByStatus("upcoming"));
RevisionRouter.get("/overdue", getRevisionsByStatus("overdue"));
RevisionRouter.get("/completed", getRevisionsByStatus("completed"));
RevisionRouter.get("/due", getRevisionsDue);
RevisionRouter.get("/stats", revisionStats);

RevisionRouter.get("/:id", getRevisionDetails);
RevisionRouter.post("/:id/attempts", saveRevisionAttempt);
RevisionRouter.patch("/:id/schedules/:scheduleId/complete", completeRevision);
RevisionRouter.patch("/:id/schedules/:scheduleId/reschedule", rescheduleRevision);
RevisionRouter.patch("/:id/original-solved-at", updateOriginalSolvedAt);
RevisionRouter.patch("/:id/pause", pauseRevision);
RevisionRouter.patch("/:id/resume", resumeRevision);
RevisionRouter.delete("/:id", removeFromRevision);

export default RevisionRouter;
