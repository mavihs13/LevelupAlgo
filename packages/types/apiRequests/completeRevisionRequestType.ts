import type { solvingMethodType } from "@repo/types/apiResponse/revisionAttemptType";

export interface completeRevisionRequestType {
    // Schedule id is also part of the route; kept here for flexibility.
    scheduleId?: string;
    confidenceRating?: number; // 1-5
    solvingMethod?: solvingMethodType;
    timeTaken?: number | null; // minutes
    notes?: string | null;
}
