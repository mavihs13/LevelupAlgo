import type { basicResponseType } from "./basicResponseType.ts";
import type { revisionScheduleType } from "./revisionScheduleType.ts";
import type { revisionAttemptType } from "./revisionAttemptType.ts";
import type { revisionRecordType } from "./revisionRecordType.ts";

export interface revisionDetailsResponseType extends basicResponseType {
    record: revisionRecordType;
    schedules: Array<revisionScheduleType & { attempts: revisionAttemptType[] }>;
}
