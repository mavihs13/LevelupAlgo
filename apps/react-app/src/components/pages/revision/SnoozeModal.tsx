import { useState } from "react";
import { toast } from "react-toastify";
import { rescheduleRevision } from "../../../api/revisionApi";
import { toISODate } from "../../../api/revisionUtils";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { revisionSnoozeState, type RevisionReviseState } from "../../../recoilstates/revision/revisionState";

export default function SnoozeModal({ onReload }: { onReload: () => void }) {
    const state = useRecoilValue(revisionSnoozeState);
    if (!state) return null;
    return <SnoozeModalContent state={state} onReload={onReload} />;
}

function SnoozeModalContent({ state, onReload }: { state: RevisionReviseState; onReload: () => void }) {
    const setSnooze = useSetRecoilState(revisionSnoozeState);
    const { record, schedule } = state;

    // Initialized from props; the component unmounts when the atom is null,
    // so every new snooze opens with the correct pre-filled date.
    const [dateStr, setDateStr] = useState(toISODate(schedule.scheduledDate));

    const close = () => {
        setSnooze(null);
        onReload();
    };

    const handleConfirm = async () => {
        if (!dateStr) return;
        try {
            await rescheduleRevision(record.id, schedule.id, { scheduledDate: dateStr });
            toast.success(`Revision #${schedule.revisionNumber} rescheduled`);
            close();
        } catch {
            toast.error("Failed to reschedule");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0f172a] border border-white/[0.06] rounded-xl w-full max-w-xs p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white">Snooze / Reschedule</h3>
                <p className="text-sm text-gray-400 mt-1">{record.questionTitle} · Revision #{schedule.revisionNumber}</p>

                <label className="text-xs font-semibold text-gray-400 uppercase mt-4 block">New date</label>
                <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="w-full mt-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white outline-none" />
                <p className="text-[11px] text-gray-500 mt-1.5">Changing the date keeps the rest of the schedule intact.</p>

                <div className="flex justify-end gap-3 mt-5">
                    <button onClick={close} className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/[0.08]">Cancel</button>
                    <button onClick={handleConfirm} disabled={!dateStr} className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60">Save</button>
                </div>
            </div>
        </div>
    );
}
