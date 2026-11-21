export type solvingMethodType = "independent" | "hints" | "solution" | "could_not_solve";

export interface revisionAttemptType {
    id: string;
    revisionScheduleId: string;
    userId: string;
    confidenceRating: number;
    solvingMethod: solvingMethodType;
    timeTaken: number | null;
    notes: string;
    attemptedAt: Date;
    completedAt: Date | null;
}
