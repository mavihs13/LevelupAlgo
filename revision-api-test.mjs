// revision-api-test.mjs — end-to-end API test for the Smart DSA Revision Tracker
const BASE = "http://localhost:3002";
const email = `revtest${Date.now() % 100000}@example.com`;
const password = "test-password-123";

let passed = 0, failed = 0;
function check(name, cond, extra) {
    if (cond) { passed++; console.log(`  ✓ ${name}`); }
    else { failed++; console.log(`  ✗ ${name}` + (extra !== undefined ? ` — ${JSON.stringify(extra).slice(0, 300)}` : "")); }
}
async function j(res) { try { return await res.json(); } catch { return null; } }
function idOf(obj, path) {
    let cur = obj;
    for (const k of path) { if (!cur) return null; cur = cur[k]; }
    return cur != null ? String(cur) : null;
}

async function main() {
    console.log("== 1. Register");
    let r = await j(await fetch(`${BASE}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Rev Test", email, password }) }));
    check("register success", r?.success === true, r);

    console.log("== 2. Login");
    r = await j(await fetch(`${BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }));
    const token = r?.token;
    check("login returns token", !!token, r);
    const A = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const AH = { Authorization: `Bearer ${token}` };

    console.log("== 3. Auth check");
    r = await fetch(`${BASE}/revisions`, AH);
    check("GET /revisions without token → 401", r.status === 401, r.status);

    console.log("== 4. Create sheet");
    r = await j(await fetch(`${BASE}/sheet/createSheet`, { method: "POST", headers: A, body: JSON.stringify({ name: "Revision Test Sheet" }) }));
    const sheetId = idOf(r, ["sheet", "id"]);
    check("sheet created", !!sheetId, r);

    console.log("== 5. Add root folder");
    r = await j(await fetch(`${BASE}/sheet/folder`, { method: "POST", headers: A, body: JSON.stringify({ name: "Test Folder", parentFolderId: sheetId, sheetId }) }));
    const folderId = idOf(r, ["Folder", "id"]);
    check("folder created", !!folderId, r);

    console.log("== 6. Add two questions");
    const mkQ = (title, link) => ({ title, platform: "LeetCode", difficulty: "medium", link, resourceLink: "", notes: "test", sheetId, folderId });
    r = await j(await fetch(`${BASE}/sheet/question`, { method: "POST", headers: A, body: JSON.stringify({ sheetId, folderId, question: mkQ("Test Question One", "https://leetcode.com/problems/test-question-one/") }) }));
    const qid1 = idOf(r, ["Question", "id"]);
    check("question 1 added", !!qid1, r);
    r = await j(await fetch(`${BASE}/sheet/question`, { method: "POST", headers: A, body: JSON.stringify({ sheetId, folderId, question: mkQ("Test Question Two", "https://leetcode.com/problems/test-question-two/") }) }));
    const qid2 = idOf(r, ["Question", "id"]);
    check("question 2 added", !!qid2, r);

    console.log("== 7. POST /revisions by name");
    r = await j(await fetch(`${BASE}/revisions`, { method: "POST", headers: A, body: JSON.stringify({ questionName: "Test Question One" }) }));
    const rec1 = idOf(r, ["record", "id"]);
    check("add by name success", r?.success === true && !!rec1, r);
    check("record title matches", r?.record?.questionTitle === "Test Question One", r?.record?.questionTitle);
    const scheds1 = r?.schedules ?? [];
    check("6 schedules generated", scheds1.length === 6, scheds1.map(s => s.revisionNumber));
    check("revisions 1..6 with intervals", [3, 7, 15, 30, 60, 120].every(iv => scheds1.some(s => s.intervalDays === iv)), scheds1.map(s => [s.revisionNumber, s.intervalDays]));
    const s1 = scheds1.find(s => s.revisionNumber === 1);
    check("scheduledDate present", !!s1?.scheduledDate, s1);

    console.log("== 8. POST /revisions unknown name → 404");
    r = await fetch(`${BASE}/revisions`, { method: "POST", headers: A, body: JSON.stringify({ questionName: "No Such Question Exists 12345" }) });
    check("404 on unknown name", r.status === 404, r.status);

    console.log("== 9. POST /revisions by link (question 2)");
    r = await j(await fetch(`${BASE}/revisions`, { method: "POST", headers: A, body: JSON.stringify({ questionLink: "https://leetcode.com/problems/test-question-two/" }) }));
    const rec2 = idOf(r, ["record", "id"]);
    check("add by link success", r?.success === true && !!rec2 && r.record.questionTitle === "Test Question Two", r);

    console.log("== 10. Duplicate add → existing record");
    r = await j(await fetch(`${BASE}/revisions`, { method: "POST", headers: A, body: JSON.stringify({ questionName: "Test Question One" }) }));
    check("duplicate returns existing", r?.success === true && /already/.test(r?.message ?? "") && r?.record?.id === rec1, r);

    console.log("== 11. GET /revisions list");
    r = await j(await fetch(`${BASE}/revisions`, { headers: AH }));
    check("list has ≥ 2 records", r?.success === true && Array.isArray(r.records) && r.records.length >= 2, r);

    console.log("== 12. GET /revisions/{today,upcoming,overdue,completed,due,stats}");
    for (const ep of ["today", "upcoming", "overdue", "completed", "due", "stats"]) {
        const res = await fetch(`${BASE}/revisions/${ep}`, { headers: AH });
        check(`GET /revisions/${ep} → 200`, res.status === 200, res.status);
        r = await j(res);
        if (ep === "stats") check("stats.totalRevised ≥ 2", (r?.totalRevised ?? 0) >= 2, r);
        if (ep === "due") check("GET /revisions/due → 200 + shape", r?.success === true && Array.isArray(r.due), r);
        if (ep === "upcoming") check("upcoming lists question one", (r?.schedules ?? []).some(s => s.record?.questionTitle === "Test Question One"), r);
    }

    console.log("== 13. GET /revisions/:id");
    r = await j(await fetch(`${BASE}/revisions/${rec1}`, { headers: AH }));
    check("record + 6 schedules", r?.record?.id === rec1 && (r?.schedules ?? []).length === 6, r);

    console.log("== 14. Complete revision 1 (performance fields)");
    const s1id = r.schedules.find(s => s.revisionNumber === 1)?.id;
    r = await j(await fetch(`${BASE}/revisions/${rec1}/schedules/${s1id}/complete`, {
        method: "PATCH", headers: A,
        body: JSON.stringify({ confidenceRating: 4, solvingMethod: "independent", timeTaken: 10, notes: "tested via API" })
    }));
    check("complete ok", r?.success === true && r?.schedule?.status === "completed", r);
    const res2 = await fetch(`${BASE}/revisions/${rec1}/schedules/${s1id}/complete`, { method: "PATCH", headers: A, body: JSON.stringify({}) });
    check("second complete → 409", res2.status === 409, res2.status);

    console.log("== 15. Reschedule revision 2");
    r = await j(await fetch(`${BASE}/revisions/${rec1}`, { headers: AH }));
    const s2id = r.schedules.find(s => s.revisionNumber === 2)?.id;
    const newDate = new Date().toISOString(); // due today — for the /due endpoint check
    r = await j(await fetch(`${BASE}/revisions/${rec1}/schedules/${s2id}/reschedule`, {
        method: "PATCH", headers: A, body: JSON.stringify({ scheduledDate: newDate })
    }));
    check("reschedule ok", r?.success === true && r?.schedule?.scheduledDate, r);

    console.log("== 16. Pause / resume");
    r = await j(await fetch(`${BASE}/revisions/${rec1}/pause`, { method: "PATCH", headers: A, body: "{}" }));
    check("pause → paused", r?.record?.status === "paused", r);
    r = await j(await fetch(`${BASE}/revisions/${rec1}/resume`, { method: "PATCH", headers: A, body: "{}" }));
    check("resume → active", r?.record?.status === "active", r);

    console.log("== 17. GET /revisions/:id after completion");
    r = await j(await fetch(`${BASE}/revisions/${rec1}`, { headers: AH }));
    const s1full = r.schedules.find(s => s.revisionNumber === 1);
    const s2full = r.schedules.find(s => s.revisionNumber === 2);
    check("rev1 completed with attempt", s1full?.status === "completed" && (s1full?.attempts ?? []).length === 1, r.schedules);
    check("rev2 pending", s2full?.status === "pending", r.schedules);
    check("attempt fields saved", (s1full?.attempts?.[0]?.confidenceRating ?? 0) === 4 && (s1full?.attempts?.[0]?.solvingMethod ?? "") === "independent", s1full?.attempts?.[0]);

    r = await j(await fetch(`${BASE}/revisions/due`, { headers: AH }));
    check("due lists question one (rev2 due today)", (r?.due ?? []).some(s => s.record?.questionTitle === "Test Question One"), r);

    console.log("== 18. DELETE /revisions/:id");
    r = await j(await fetch(`${BASE}/revisions/${rec2}`, { method: "DELETE", headers: A }));
    check("delete ok", r?.success === true, r);
    const resDel = await fetch(`${BASE}/revisions/${rec2}`, { headers: AH });
    check("404 after delete", resDel.status === 404, resDel.status);

    console.log("== 19. POST /revisions with no question fields → 400");
    r = await fetch(`${BASE}/revisions`, { method: "POST", headers: A, body: JSON.stringify({}) });
    check("400 when nothing provided", r.status === 400, r.status);

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
