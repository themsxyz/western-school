// ========== MODERN LOADER ==========
    function showLoader(show) {
        const overlay = document.getElementById('loaderOverlay');
        if (show) overlay.classList.add('active');
        else overlay.classList.remove('active');
    }

    // ========== GLASSMORPHISM TOAST (with SVG icons) ==========
    function showToast(message, type = "info") {
        const root = document.getElementById("toastRoot");
        const toast = document.createElement("div");
        let baseClass = "result-toast-message";
        if (type === "success") baseClass += " result-toast-success";
        else if (type === "error") baseClass += " result-toast-error";
        toast.className = baseClass;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/><polyline points="18 8 12 16 8 12"/>
                       </svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                       </svg>`;
        } else {
            iconSvg = `<svg class="toast-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                       </svg>`;
        }
        
        toast.innerHTML = `
            ${iconSvg}
            <span style="flex:1;">${message}</span>
            <button class="toast-close-btn" aria-label="Close">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        root.appendChild(toast);
        
        // close button event
        const closeBtn = toast.querySelector('.toast-close-btn');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
        
        // auto remove after 4.5 seconds
        setTimeout(() => {
            if (toast && toast.remove) toast.remove();
        }, 4500);
    }

    // ========== API & CLASS STATE ==========
    const CLASS_API_MAP = {
        nursery: "https://script.google.com/macros/s/AKfycbzRBVqJZnQCez3AS27DIMNqc83NnkDBdzUs4IZfmIsn2qOxkOe1_DM8NQvMjCPtwwiS/exec",
        play: "https://script.google.com/macros/s/AKfycbzhtst-Y7Z4BNtDNW76zginGzhVJ9CCYM8WOot2Ij1IzPLrtxVIb6p7JuDT_ZOhgiKi/exec",
        kg: "https://script.google.com/macros/s/AKfycbxRDeg7egxUdLpjdQg8d37WvcNw1xQMd-QpfwnqC3Si2hWh7HCYjE8jBvzAqWb4ED0/exec",
        class1: "https://script.google.com/macros/s/AKfycby9Fv1xZGyZwNAfDFOKVC6Cf7q86GMz4cWvxO4u-jeC8ejMAaLc8rgmx2KDESAA134T/exec",
        class2: "https://script.google.com/macros/s/AKfycbyxfRJFIkoi5IZabxs1MiVqBNb5HgIWUR2nG0TjXLf1S7AXyW8uGMFVlJ009pXLY4JnfA/exec",
        class3: "https://script.google.com/macros/s/AKfycbzxg-lf8ZvBpw9L-kzPdpxRRTtdxnCGNSiyc_UElLihDpRr6zl4YxZIoKDek7IXtlsv/exec",
        class4: "https://script.google.com/macros/s/AKfycbyzuGgkk4osZCf45qkb40RKSa6I3nBFhLSG3B618rn0_PaBMv62K8YIh8R7-eGQqydF/exec",
        class5: "https://script.google.com/macros/s/AKfycbzHlGMzOU5gqxOl9RsgVTjwXioS0ddq6nlNO7pvxsJoSdS4RJX5OznHnb4O_WRHlxTDvg/exec"
    };
    let currentApiUrl = null, currentActiveClassKey = null;

    function updateClassStatusUI() {
        const area = document.getElementById("classStatusArea");
        if (currentApiUrl && currentActiveClassKey) {
            let displayName = { nursery:"নার্সারি", play:"প্লে", kg:"কেজি", class1:"প্রথম শ্রেণি", class2:"দ্বিতীয় শ্রেণি", class3:"তৃতীয় শ্রেণি", class4:"চতুর্থ শ্রেণি", class5:"পঞ্চম শ্রেণি" }[currentActiveClassKey];
            area.innerHTML = `<div style="background:#e9e0cf; border-radius:2rem; padding:0.4rem 1.2rem; font-weight:600;">✅ সক্রিয় ক্লাস: ${displayName}</div>`;
        } else area.innerHTML = `<div style="background:#ffe6cc; border-radius:2rem; padding:0.4rem 1rem;">⚠️ কোন সক্রিয় ক্লাস নেই।</div>`;
    }

    async function callApi(action, payload) {
        if (!currentApiUrl) throw new Error("No active class");
        showLoader(true);
        try {
            const res = await fetch(currentApiUrl, { method: "POST", body: JSON.stringify({ action, ...payload }) });
            const data = await res.json();
            return data;
        } finally {
            showLoader(false);
        }
    }

    function activateClass(classKey) {
        const url = CLASS_API_MAP[classKey];
        if (!url) return false;
        currentApiUrl = url;
        currentActiveClassKey = classKey;
        updateClassStatusUI();
        showToast(`${classKey.toUpperCase()} ক্লাস সক্রিয়`, "success");
        return true;
    }

    document.getElementById("applyClassBtn").onclick = () => {
        const val = document.getElementById("classSelect").value;
        if (val) activateClass(val);
        else showToast("ক্লাস নির্বাচন করুন", "warning");
    };
    updateClassStatusUI();

    // ========== GRADING RULES ==========
    async function loadGradingRulesAndDisplay() {
        if (!currentApiUrl) return;
        try {
            const res = await callApi("getGradingRules", {});
            if (res.status === "ok") {
                window.currentGradingRules = res.rules;
                renderGradingRulesForm(res.rules);
            }
        } catch (e) { console.log(e); }
    }
    
    function renderGradingRulesForm(rules) {
        const container = document.getElementById("gradingRulesPanel");
        let html = `<label>পাস মার্ক (%): <input type="number" id="passMark" class="result-input" value="${rules.passMark}" style="width:100px;"></label><br><br>
            <table class="result-data-table"><thead><tr><th>ন্যূনতম %</th><th>জিপিএ</th></tr></thead><tbody>`;
        for (let i = 0; i < rules.thresholds.length; i++) {
            html += `<tr><td><input type="number" id="th_${i}" class="result-input" value="${rules.thresholds[i]}"></td>
                            <td><input type="number" id="gpa_${i}" class="result-input" value="${rules.gpaValues[i]}" step="0.01"></td></tr>`;
        }
        html += `</tbody></table>`;
        container.innerHTML = html;
    }
    
    document.getElementById("showGradingBtn").onclick = () => {
        const panel = document.getElementById("gradingRulesPanel");
        const saveContainer = document.getElementById("gradingSaveContainer");
        if (panel.style.display === "none") {
            panel.style.display = "block";
            saveContainer.style.display = "block";
            if (currentApiUrl) loadGradingRulesAndDisplay();
        } else {
            panel.style.display = "none";
            saveContainer.style.display = "none";
        }
    };
    
    document.getElementById("saveGradingRulesBtn").onclick = async () => {
        if (!currentApiUrl) { showToast("ক্লাস সক্রিয় করুন", "error"); return; }
        const passMark = parseFloat(document.getElementById("passMark").value);
        let thresholds = [], gpaValues = [];
        for (let i = 0; i < 7; i++) {
            let th = parseFloat(document.getElementById(`th_${i}`)?.value);
            if (!isNaN(th)) thresholds.push(th);
            let gpa = parseFloat(document.getElementById(`gpa_${i}`)?.value);
            if (!isNaN(gpa)) gpaValues.push(gpa);
        }
        const res = await callApi("setGradingRules", { rules: { thresholds, gpaValues, passMark } });
        if (res.status === "ok") { showToast("গ্রেডিং নিয়ম আপডেট", "success"); }
        else showToast("ত্রুটি", "error");
    };

    // ========== RESULT DISPLAY ==========
    function displayNewResults(r1, r2, r3) {
        const container = document.getElementById("resultContainer");
        let html = "";
        for (let i = 1; i <= 3; i++) {
            let exam = i === 1 ? r1 : (i === 2 ? r2 : r3);
            if (exam && exam.subjects && exam.subjects.length) {
                html += `<div style="margin-bottom:1.5rem; border:1px solid #e2cfb3; border-radius:1rem; padding:0.8rem;">
                            <h4 style="color:#8b5a2b;">📌 পরীক্ষা ${i}</h4>
                            <table class="result-data-table"><thead><tr><th>বিষয়</th><th>সর্বোচ্চ</th><th>প্রাপ্ত</th><th>জিপিএ</th><th>%</th><th>ফলাফল</th></tr></thead><tbody>`;
                exam.subjects.forEach(sub => {
                    html += `<tr><td>${sub.subject}</td><td>${sub.maxMarks}</td><td>${sub.obtained}</td><td>${sub.gpa}</td><td>${sub.percentage}%</td><td><span class="${sub.status === 'Pass' ? 'result-badge-success' : 'result-badge-danger'}">${sub.status}</span></td></tr>`;
                });
                html += `<tr class="result-summary-row"><td colspan="3"><strong>সামগ্রিক জিপিএ</strong></td><td colspan="3"><strong>${exam.overallGPA}</strong></td></tr>
                           <tr><td colspan="3"><strong>সর্বমোট %</strong></td><td colspan="3"><strong>${exam.overallPercentage}%</strong></td></tr>
                           <tr><td colspan="3"><strong>সামগ্রিক ফলাফল</strong></td><td colspan="3"><strong>${exam.overallStatus}</strong></td></tr></tbody></table></div>`;
            } else {
                html += `<div style="margin-bottom:1rem; padding:0.5rem; background:#f9f2e0; border-radius:1rem;"><h4>পরীক্ষা ${i}</h4><p>কোনো ফলাফল পাওয়া যায়নি</p></div>`;
            }
        }
        container.innerHTML = html;
    }

    document.getElementById("resultSearchBtn").onclick = async () => {
        if (!currentApiUrl) { showToast("ক্লাস সক্রিয় করুন", "error"); return; }
        const id = document.getElementById("resultSearchId").value.trim();
        if (!id) return;
        const res = await callApi("getFullData", { id });
        if (res.status === "found") {
            displayNewResults(res.result1, res.result2, res.result3);
            document.getElementById("resultForm").classList.remove("result-hidden");
        } else showToast("শিক্ষার্থী পাওয়া যায়নি", "error");
    };

    document.getElementById("addResultBtn").onclick = async () => {
        if (!currentApiUrl) return;
        const id = document.getElementById("resultSearchId").value.trim();
        const examNo = parseInt(document.getElementById("examNo").value);
        const selectedSubject = document.getElementById("subjectName").value;
        const maxMarks = parseFloat(document.getElementById("maxMarksResult").value);
        const obtained = parseFloat(document.getElementById("obtainedMarks").value);
        if (!id || !selectedSubject || isNaN(obtained) || isNaN(maxMarks)) {
            showToast("সব তথ্য পূরণ করুন", "warning");
            return;
        }
        const subjectMap = { "ইংরেজی":"English", "বাংলা":"Bengali", "গণিত":"Math", "চারু ও কারুকলা":"Drawing" };
        const subject = subjectMap[selectedSubject];
        if (!subject) { showToast("অবৈধ বিষয়", "error"); return; }
        const res = await callApi("addResult", { id, examNo, subject, obtained, maxMarks });
        if (res.status === "ok") {
            showToast("ফলাফল সংরক্ষিত", "success");
            document.getElementById("resultSearchBtn").click();
        } else showToast("ত্রুটি – " + (res.message || "অজানা"), "error");
    };

    // ========== ATTENDANCE ==========
    async function loadAttendanceTables(id) {
        if (!currentApiUrl) return;
        const res = await callApi("getFullData", { id });
        if (res.status === "found" && res.attendanceTables) renderAttendanceTables(res.attendanceTables);
        else renderAttendanceTables([{ totalClass:0, totalAttendance:0 }, { totalClass:0, totalAttendance:0 }, { totalClass:0, totalAttendance:0 }]);
    }
    
    function renderAttendanceTables(tables) {
        const container = document.getElementById("attendanceTablesContainer");
        let html = "";
        for (let i = 0; i < 3; i++) {
            html += `<div class="result-attendance-panel">
                        <h5>📋 পরীক্ষা ${i + 1}</h5>
                        <label>মোট ক্লাস: <input type="number" id="totalClass_${i+1}" class="result-input" value="${tables[i].totalClass}" style="width:90px;"></label>
                        <label style="margin-left:1rem;">মোট উপস্থিতি: <input type="number" id="totalAttendance_${i+1}" class="result-input" value="${tables[i].totalAttendance}" style="width:90px;"></label>
                        <button class="result-save-attendance-btn result-btn result-btn-secondary" data-exam="${i+1}" style="margin-left:1rem;">সংরক্ষণ</button>
                    </div>`;
        }
        container.innerHTML = html;
        for (let i = 1; i <= 3; i++) {
            document.querySelector(`.result-save-attendance-btn[data-exam="${i}"]`)?.addEventListener("click", async () => {
                const id = document.getElementById("attSearchId").value.trim();
                if (!id) { showToast("শিক্ষার্থী আইডি দিন", "warning"); return; }
                const totalClass = parseFloat(document.getElementById(`totalClass_${i}`).value) || 0;
                const totalAttendance = parseFloat(document.getElementById(`totalAttendance_${i}`).value) || 0;
                const res = await callApi("updateAttendanceTable", { id, examNo: i, totalClass, totalAttendance });
                if (res.status === "ok") showToast(`পরীক্ষা ${i} উপস্থিতি সংরক্ষিত`, "success");
                else showToast("ত্রুটি", "error");
            });
        }
    }
    
    document.getElementById("attSearchBtn").onclick = async () => {
        if (!currentApiUrl) { showToast("ক্লাস সক্রিয় করুন", "error"); return; }
        const id = document.getElementById("attSearchId").value.trim();
        if (id) await loadAttendanceTables(id);
        else showToast("আইডি দিন", "warning");
    };

    // ENTER KEY shortcuts
    document.getElementById("resultSearchId").addEventListener("keypress", (e) => { if(e.key === "Enter") document.getElementById("resultSearchBtn").click(); });
    document.getElementById("attSearchId").addEventListener("keypress", (e) => { if(e.key === "Enter") document.getElementById("attSearchBtn").click(); });

    // Clear UI & reload (safe)
    document.getElementById("clearUiBtn").onclick = () => { 
        if(confirm("সব তথ্য মুছবেন? পৃষ্ঠা রিলোড হবে")) location.reload(); 
    };