import type { basicResponseType } from "./basicResponseType.ts";
import type { revisionRecordType } from "./revisionRecordType.ts";

export interface revisionListResponseType extends basicResponseType {
    records: revisionRecordType[];
    total: number;
    page: number;
    totalPages: number;
}
