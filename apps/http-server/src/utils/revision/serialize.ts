import type { revisionAttemptType } from "@repo/types/apiResponse/revisionAttemptType";
import type { revisionRecordType } from "@repo/types/apiResponse/revisionRecordType";
import type { revisionScheduleType } from "@repo/types/apiResponse/revisionScheduleType";

export const SOLVING_METHODS: revisionAttemptType["solvingMethod"][] = ["independent", "hints", "solution", "could_not_solve"];

/** Serialize a RevisionRecord document to the client-facing type. */
export function toRevisionRecordType(record: any): revisionRecordType {
    return {
        id: record._id.toString(),
        userId: record.userId.toString(),
        questionId: record.questionId.toString(),
        // Denormalized snapshot so the tracker stays self-contained
        questionTitle: record.questionTitle,
        platform: record.platform ?? null,
        difficulty: record.difficulty ?? null,
        folderId: record.folderId ?? null,
        folderName: record.folderName ?? null,
        sheetId: record.sheetId ?? null,
        questionLink: record.questionLink ?? null,
        originalSolvedAt: record.originalSolvedAt ?? null,
        status: record.status,
        legacyStatus: record.legacyStatus ?? null
    };
}

/** Serialize a RevisionSchedule document to the client-facing type. */
export function toRevisionScheduleType(schedule: any): revisionScheduleType {
    return {
        id: schedule._id.toString(),
        revisionRecordId: schedule.revisionRecordId.toString(),
        revisionNumber: schedule.revisionNumber,
        intervalDays: schedule.intervalDays,
        scheduledDate: schedule.scheduledDate,
        completedAt: schedule.completedAt ?? null,
        status: schedule.status,
        rescheduledFrom: schedule.rescheduledFrom ?? null
    };
}

/** Serialize a RevisionAttempt document to the client-facing type. */
export function toRevisionAttemptType(attempt: any): revisionAttemptType {
    return {
        id: attempt._id.toString(),
        revisionScheduleId: attempt.revisionScheduleId.toString(),
        userId: attempt.userId.toString(),
        confidenceRating: attempt.confidenceRating,
        solvingMethod: attempt.solvingMethod,
        timeTaken: attempt.timeTaken ?? null,
        notes: attempt.notes ?? "",
        attemptedAt: attempt.attemptedAt,
        completedAt: attempt.completedAt ?? null
    };
}
