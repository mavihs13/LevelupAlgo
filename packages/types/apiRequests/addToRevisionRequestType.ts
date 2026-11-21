export interface addToRevisionRequestType {
    questionId?: string; // when provided, used directly
    questionName?: string; // otherwise: exact title match, then case-insensitive
    questionLink?: string; // otherwise: match against the question link
    originalSolvedAt?: string | null; // optional; defaults to question.solvedAt or today
    legacyStatus?: string | null;
}
