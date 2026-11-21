import { atom } from "recoil";
import type { revisionRecordType } from "@repo/types/apiResponse/revisionRecordType";
import type { revisionScheduleType } from "@repo/types/apiResponse/revisionScheduleType";
import type { revisionStatsType } from "@repo/types/apiResponse/revisionStatsType";
import type { revisionStatusResponseType } from "@repo/types/apiResponse/revisionStatusResponseType";

export const revisionRecordsState = atom<revisionRecordType[]>({
    key: "revisionRecordsState",
    default: []
});

export const revisionStatsState = atom<revisionStatsType | null>({
    key: "revisionStatsState",
    default: null
});

export const revisionTodayState = atom<revisionStatusResponseType["schedules"]>({
    key: "revisionTodayState",
    default: []
});

export const revisionDueState = atom<revisionStatusResponseType["schedules"]>({
    key: "revisionDueState",
    default: []
});

export const revisionUpcomingState = atom<revisionStatusResponseType["schedules"]>({
    key: "revisionUpcomingState",
    default: []
});

export const revisionOverdueState = atom<revisionStatusResponseType["schedules"]>({
    key: "revisionOverdueState",
    default: []
});

export const revisionCompletedState = atom<revisionStatusResponseType["schedules"]>({
    key: "revisionCompletedState",
    default: []
});

export interface RevisionReviseState {
    record: revisionRecordType;
    schedule: revisionScheduleType;
}

export const revisionReviseState = atom<RevisionReviseState | null>({
    key: "revisionReviseState",
    default: null
});

export const revisionSnoozeState = atom<RevisionReviseState | null>({
    key: "revisionSnoozeState",
    default: null
});
