import type { basicResponseType } from "./basicResponseType.ts";
import type { revisionScheduleType } from "./revisionScheduleType.ts";
import type { revisionRecordType } from "./revisionRecordType.ts";
import type { revisionAttemptType } from "./revisionAttemptType.ts";

export interface revisionStatusResponseType extends basicResponseType {
    schedules: Array<revisionScheduleType & { record: revisionRecordType | null; attempts: revisionAttemptType[] }>;
}
