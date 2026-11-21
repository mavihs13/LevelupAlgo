import type { solvingMethodType } from "@repo/types/apiResponse/revisionAttemptType";

export interface saveRevisionAttemptRequestType {
    scheduleId: string;
    confidenceRating: number; // 1-5
    solvingMethod: solvingMethodType;
    timeTaken?: number | null; // minutes
    notes?: string | null;
}
