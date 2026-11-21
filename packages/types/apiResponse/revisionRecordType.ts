export interface revisionRecordType {
    id: string;
    userId: string;
    questionId: string;
    // Denormalized snapshot so the tracker stays self-contained
    questionTitle: string;
    platform: string | null;
    difficulty: string | null;
    folderId: string | null;
    folderName: string | null;
    sheetId: string | null;
    questionLink: string | null;
    originalSolvedAt: Date | null;
    status: "active" | "paused";
    legacyStatus: string | null;
}
