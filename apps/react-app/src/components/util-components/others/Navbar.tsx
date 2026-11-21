import { Bell, ChevronDown, FilePen, ListChecks, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { allSheetsState } from '../../../recoilstates/sheet/allSheetsState';
import axios, { isAxiosError } from 'axios';
import { toast } from 'react-toastify';
import { createSheetModalOpen } from '../../../recoilstates/sheet/createSheetModalState';
import { viewAllSheetsModalOpen } from '../../../recoilstates/sheet/viewAllSheetsModalOpenState';
import { currentSheet } from '../../../recoilstates/sheet/currentSheet';
import { userState } from '../../../recoilstates/user/userState';
import { getRevisionByStatus } from '../../../api/revisionApi';
import { revisionTodayState } from '../../../recoilstates/revision/revisionState';

function Navbar() {
    const navigate = useNavigate();
    const [selectedField, setSelectedField] = useState<string>("");
    const [sheetsDropdownOpen, setSheetsDropdownOpen] = useState(false);
    const [allSheets, setAllSheets] = useRecoilState(allSheetsState);
    const [current_Sheet, setCurrentSheet] = useRecoilState(currentSheet);
    const [, setOpenCreateModal] = useRecoilState(createSheetModalOpen);
    const setOpenViewSheetModal = useSetRecoilState(viewAllSheetsModalOpen);
    const userDetails = useRecoilValue(userState);
    const todayRevisions = useRecoilValue(revisionTodayState);
    const setTodayRevisions = useSetRecoilState(revisionTodayState);

    const handleNavigate = (path: string) => {
        navigate(`/${path}`);
    };

    useEffect(() => {
        // Badge on the Revisions icon: number of revision items due today
        (async () => {
            try {
                const res = await getRevisionByStatus("today");
                setTodayRevisions(res.schedules ?? []);
            } catch {
                /* ignore badge fetch failures */
            }
        })();
    }, [setTodayRevisions]);

    useEffect(() => {
        // Fetch all sheets for the dropdown
        const fetchSheets = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/sheet/SheetList`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const data = response.data;
                if (!data.success) {
                    toast.error(data.error);
                    if (data.redirect) navigate(data.redirect);
                    return;
                }
                setAllSheets(data.sheets);
            } catch (err) {
                if (isAxiosError(err)) {
                    toast.error(err.response?.data?.error || err.message);
                    const redirect = err.response?.data?.redirect;
                    if (redirect) navigate(redirect);
                } else if (err instanceof Error) {
                    toast.error(err.message);
                }
            }
        };
        fetchSheets();
    }, [navigate, setAllSheets]);

    const navButtonClass = (active: boolean) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
            active
                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30"
                : "text-gray-200 hover:text-white hover:bg-white/[0.06] border-white/[0.08] hover:border-white/[0.14]"
        }`;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] flex h-14 items-center justify-between gap-6 border-b border-white/[0.06] bg-[#0a0e1a] backdrop-blur-md shadow-lg shadow-black/20 px-6">
            {/* Logo → dashboard */}
            <button onClick={() => handleNavigate("dashboard")} className="flex-shrink-0 hover:cursor-pointer" aria-label="Open dashboard">
                <img src="/logo.png" alt="logo" className="h-9 w-9" />
            </button>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Editor */}
                <button
                    onClick={() => { setSelectedField("Editor"); handleNavigate("editor"); }}
                    className={navButtonClass(selectedField === "Editor")}
                >
                    <FilePen size={15} />
                    Editor
                </button>

                {/* Sheets dropdown */}
                <div className="relative select-none">
                    <button
                        onClick={() => setSheetsDropdownOpen(o => !o)}
                        className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.14] px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 text-sm text-gray-200"
                    >
                        <span>Sheets</span>
                        <ChevronDown size={13} className={`transition-transform ${sheetsDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {sheetsDropdownOpen && (
                        <div className="absolute right-0 mt-2 min-w-48 bg-[#0b1020] border border-white/[0.08] rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="max-h-60 overflow-y-auto">
                                {allSheets.length === 0 ? (
                                    <div className="px-3 py-2 text-xs text-gray-500">No sheets yet</div>
                                ) : (
                                    allSheets.map((sheet) => (
                                        <button
                                            key={sheet.id}
                                            onClick={() => {
                                                setCurrentSheet({ id: sheet.id, name: sheet.name });
                                                setSelectedField(sheet.name);
                                                handleNavigate(`sheet/${sheet.id}`);
                                                setSheetsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm transition ${sheet.id === current_Sheet?.id ? "text-white font-semibold bg-white/[0.05]" : "text-gray-300 hover:bg-white/[0.06]"}`}
                                        >
                                            {sheet.name}
                                        </button>
                                    ))
                                )}
                            </div>
                            <div className="border-t border-white/[0.06]" />
                            <div className="flex gap-1 p-2">
                                <button
                                    onClick={() => { setSheetsDropdownOpen(false); setOpenCreateModal(true); }}
                                    className="flex-1 py-1.5 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-gray-200 rounded transition"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => { setSheetsDropdownOpen(false); setOpenViewSheetModal(true); }}
                                    className="flex-1 py-1.5 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-gray-200 rounded transition"
                                >
                                    View All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Revisions (with badge for due-today count) */}
                <button
                    onClick={() => handleNavigate("revisions")}
                    className="relative text-gray-200 hover:text-white hover:bg-white/[0.06] p-2 rounded-lg transition-all duration-200"
                    aria-label="Open revisions tracker"
                >
                    <ListChecks size={17} />
                    {todayRevisions.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center px-1 font-semibold">
                            {todayRevisions.length}
                        </span>
                    )}
                </button>

                {/* Notifications */}
                <button
                    onClick={() => handleNavigate("notifications")}
                    className="text-gray-200 hover:text-white hover:bg-white/[0.06] p-2 rounded-lg transition-all duration-200"
                    aria-label="Open notifications"
                >
                    <Bell size={17} />
                </button>

                {/* Profile */}
                <button
                    onClick={() => handleNavigate("profile")}
                    className="flex items-center justify-center h-8 w-8 bg-white/[0.08] hover:bg-white/[0.14] rounded-full text-white font-bold text-sm transition-all duration-200 hover:scale-110"
                    aria-label="Open profile"
                >
                    {userDetails?.name ? userDetails.name[0].toUpperCase() : <User size={15} />}
                </button>
            </div>
        </div>
    );
}

export default Navbar;
