export interface revisionScheduleType {
    id: string;
    revisionRecordId: string;
    revisionNumber: number;
    intervalDays: number;
    scheduledDate: Date;
    completedAt: Date | null;
    status: "pending" | "completed";
    rescheduledFrom: Date | null;
}
