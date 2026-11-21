import { useState } from "react";
import { toast } from "react-toastify";
import { addToRevision } from "../../../api/revisionApi";
import type { addToRevisionRequestType } from "@repo/types/apiRequests/addToRevisionRequestType";

export default function RevisionAddModal({ onClose, onReload }: { onClose: () => void; onReload: () => void }) {
    const [name, setName] = useState("");
    const [link, setLink] = useState("");
    const [solvedAt, setSolvedAt] = useState("");
    const [saving, setSaving] = useState(false);

    const handleConfirm = async () => {
        const questionName = name.trim();
        const questionLink = link.trim();
        if (!questionName && !questionLink) {
            toast.warn("Enter a question name or a link.");
            return;
        }
        const body: addToRevisionRequestType = {
            questionName: questionName || undefined,
            questionLink: questionLink || undefined,
            originalSolvedAt: solvedAt || undefined
        };
        setSaving(true);
        try {
            const res = await addToRevision(body);
            if (res.success) {
                toast.success(`Added "${res.record.questionTitle}" to revision tracker`);
                onClose();
                onReload();
            } else {
                toast.info(res.message || "Failed to add question to revision tracker");
            }
        } catch {
            toast.error("Failed to add question to revision tracker");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0f172a] border border-white/[0.06] rounded-xl w-full max-w-md p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white">Add Question to Revision</h3>
                <p className="text-sm text-gray-400 mt-1">Add a DSA question to your tracker by name or link.</p>

                <div className="mt-4 space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Question Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Two Sum"
                            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Question Link (optional)</label>
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://leetcode.com/problems/two-sum/"
                            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-400"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">
                            If the question exists in your sheet, it is matched to that question; otherwise the link is used as-is.
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 block">Original Solve Date (optional)</label>
                        <input
                            type="date"
                            value={solvedAt}
                            onChange={(e) => setSolvedAt(e.target.value)}
                            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white outline-none focus:border-blue-400"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/[0.08]">Cancel</button>
                    <button onClick={handleConfirm} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60">
                        {saving ? "Adding..." : "Add to Revision"}
                    </button>
                </div>
            </div>
        </div>
    );
}
