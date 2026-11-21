import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import { completeRevision } from "../../../api/revisionApi";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { revisionReviseState, type RevisionReviseState } from "../../../recoilstates/revision/revisionState";
import type { solvingMethodType } from "@repo/types/apiResponse/revisionAttemptType";

const METHODS: { value: solvingMethodType; label: string }[] = [
    { value: "independent", label: "Solved Independently" },
    { value: "hints", label: "With Hints" },
    { value: "solution", label: "Needed Solution" },
    { value: "could_not_solve", label: "Could Not Solve" }
];

export default function ReviseModal({ onReload }: { onReload: () => void }) {
    const state = useRecoilValue(revisionReviseState);
    if (!state) return null;
    return <ReviseModalContent state={state} onReload={onReload} />;
}

function ReviseModalContent({ state, onReload }: { state: RevisionReviseState; onReload: () => void }) {
    const setRevise = useSetRecoilState(revisionReviseState);
    const { record, schedule } = state;

    const [method, setMethod] = useState<solvingMethodType>("independent");
    const [confidence, setConfidence] = useState(4);
    const [timeTaken, setTimeTaken] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setMethod("independent");
        setConfidence(4);
        setTimeTaken("");
        setNotes("");
    }, [state.schedule.id]);

    const close = () => {
        setRevise(null);
        onReload();
    };

    const handleConfirm = async () => {
        setSaving(true);
        try {
            await completeRevision(record.id, schedule.id, {
                confidenceRating: confidence,
                solvingMethod: method,
                timeTaken: timeTaken.trim() ? parseInt(timeTaken, 10) : null,
                notes: notes.trim()
            });
            toast.success(`Revision #${schedule.revisionNumber} marked as revised`);
            close();
        } catch {
            toast.error("Failed to save revision. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0f172a] border border-white/[0.06] rounded-xl w-full max-w-md p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white">Mark as Revised</h3>
                <p className="text-sm text-gray-400 mt-1">
                    {record.questionTitle} · Revision #{schedule.revisionNumber}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">How did you do? Your answers are saved in the revision history.</p>

                <div className="mt-4 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Solving method</p>
                        <div className="flex flex-wrap gap-2">
                            {METHODS.map((m) => (
                                <button
                                    key={m.value}
                                    onClick={() => setMethod(m.value)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                        method === m.value ? "bg-blue-600 text-white" : "bg-white/[0.06] text-gray-300 hover:bg-white/[0.12]"
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Confidence (1–5)</p>
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((v) => (
                                <button key={v} onClick={() => setConfidence(v)} className="text-amber-400 transition-transform hover:scale-110">
                                    <Star size={22} fill={confidence >= v ? "#fbbf24" : "none"} />
                                </button>
                            ))}
                            <span className="ml-2 text-white font-semibold">{confidence}/5</span>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Time taken (minutes, optional)</label>
                            <input
                                type="number"
                                min={0}
                                value={timeTaken}
                                onChange={(e) => setTimeTaken(e.target.value)}
                                placeholder="e.g. 25"
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Notes (optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Anything worth remembering?"
                                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none h-20 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={close} className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/[0.08]">
                        Cancel
                    </button>
                    <button onClick={handleConfirm} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60">
                        {saving ? "Saving..." : "Mark as Revised"}
                    </button>
                </div>
            </div>
        </div>
    );
}
