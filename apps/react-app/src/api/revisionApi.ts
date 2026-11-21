import axios from "axios";
import type {
    addToRevisionRequestType
} from "@repo/types/apiRequests/addToRevisionRequestType";
import type {
    completeRevisionRequestType
} from "@repo/types/apiRequests/completeRevisionRequestType";
import type {
    saveRevisionAttemptRequestType
} from "@repo/types/apiRequests/saveRevisionAttemptRequestType";
import type {
    rescheduleRevisionRequestType
} from "@repo/types/apiRequests/rescheduleRevisionRequestType";
import type {
    updateOriginalSolvedAtRequestType
} from "@repo/types/apiRequests/updateOriginalSolvedAtRequestType";

import type { revisionRecordType } from "@repo/types/apiResponse/revisionRecordType";
import type { revisionScheduleType } from "@repo/types/apiResponse/revisionScheduleType";
import type { revisionAttemptType } from "@repo/types/apiResponse/revisionAttemptType";
import type { revisionListResponseType } from "@repo/types/apiResponse/revisionListResponseType";
import type { revisionStatusResponseType } from "@repo/types/apiResponse/revisionStatusResponseType";
import type { revisionDetailsResponseType } from "@repo/types/apiResponse/revisionDetailsResponseType";
import type { revisionStatsType } from "@repo/types/apiResponse/revisionStatsType";
import type { revisionDueResponseType } from "@repo/types/apiResponse/revisionDueResponseType";

const API = import.meta.env.VITE_BACKEND_URL;

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export type RevisionAddResponse = {
    success: boolean;
    message?: string;
    record: revisionRecordType;
    schedules: revisionScheduleType[];
};

export const getRevisions = async (status?: string, page = 1, limit = 20): Promise<revisionListResponseType> => {
    const res = await axios.get<revisionListResponseType>(`${API}/revisions`, {
        params: { status, page, limit },
        ...auth()
    });
    return res.data;
};

export const getRevisionByStatus = async (status: "today" | "upcoming" | "overdue" | "completed"): Promise<revisionStatusResponseType> => {
    const res = await axios.get<revisionStatusResponseType>(`${API}/revisions/${status}`, auth());
    return res.data;
};

export const getRevisionDetails = async (id: string): Promise<revisionDetailsResponseType> => {
    const res = await axios.get<revisionDetailsResponseType>(`${API}/revisions/${id}`, auth());
    return res.data;
};

export const addToRevision = async (body: addToRevisionRequestType): Promise<RevisionAddResponse> => {
    const res = await axios.post<RevisionAddResponse>(`${API}/revisions`, body, auth());
    return res.data;
};

export const completeRevision = async (
    recordId: string,
    scheduleId: string,
    body: completeRevisionRequestType
): Promise<{ success: boolean; schedule: revisionScheduleType; attempt: revisionAttemptType }> => {
    const res = await axios.patch(`${API}/revisions/${recordId}/schedules/${scheduleId}/complete`, body, auth());
    return res.data;
};

export const saveRevisionAttempt = async (
    recordId: string,
    body: saveRevisionAttemptRequestType
): Promise<{ success: boolean; attempt: revisionAttemptType }> => {
    const res = await axios.post(`${API}/revisions/${recordId}/attempts`, body, auth());
    return res.data;
};

export const rescheduleRevision = async (
    recordId: string,
    scheduleId: string,
    body: rescheduleRevisionRequestType
): Promise<{ success: boolean; schedule: revisionScheduleType }> => {
    const res = await axios.patch(`${API}/revisions/${recordId}/schedules/${scheduleId}/reschedule`, body, auth());
    return res.data;
};

export const updateOriginalSolvedAt = async (
    recordId: string,
    body: updateOriginalSolvedAtRequestType
): Promise<{ success: boolean; record: revisionRecordType; schedules: revisionScheduleType[] }> => {
    const res = await axios.patch(`${API}/revisions/${recordId}/original-solved-at`, body, auth());
    return res.data;
};

export const pauseRevision = async (recordId: string): Promise<{ success: boolean; record: revisionRecordType }> => {
    const res = await axios.patch(`${API}/revisions/${recordId}/pause`, {}, auth());
    return res.data;
};

export const resumeRevision = async (recordId: string): Promise<{ success: boolean; record: revisionRecordType }> => {
    const res = await axios.patch(`${API}/revisions/${recordId}/resume`, {}, auth());
    return res.data;
};

export const removeFromRevision = async (recordId: string): Promise<{ success: boolean; message?: string }> => {
    const res = await axios.delete(`${API}/revisions/${recordId}`, auth());
    return res.data;
};

export const getRevisionStats = async (): Promise<revisionStatsType> => {
    const res = await axios.get<revisionStatsType>(`${API}/revisions/stats`, auth());
    return res.data;
};

export const getRevisionsDue = async (): Promise<revisionDueResponseType> => {
    const res = await axios.get<revisionDueResponseType>(`${API}/revisions/due`, auth());
    return res.data;
};
