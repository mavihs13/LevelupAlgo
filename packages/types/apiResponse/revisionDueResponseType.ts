import type { basicResponseType } from "./basicResponseType.ts";
import type { revisionScheduleType } from "./revisionScheduleType.ts";
import type { revisionRecordType } from "./revisionRecordType.ts";

export interface revisionDueItemType extends revisionScheduleType {
    record: revisionRecordType | null;
}

export interface revisionDueResponseType extends basicResponseType {
    due: revisionDueItemType[];
}
