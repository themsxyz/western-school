  // ---------- TOAST ----------
    function showToast(message, type = "info") {
        const root = document.getElementById("toastRoot");
        const toast = document.createElement("div");
        toast.className = `toast-message ${type === "success" ? "toast-success" : (type === "error" ? "toast-error" : "")}`;
        let icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
        toast.innerHTML = `<span>${icon}</span><span>${message}</span><span style="margin-left:auto; cursor:pointer;" onclick="this.parentElement.remove()">✕</span>`;
        root.appendChild(toast);
        setTimeout(() => { if(toast && toast.remove) toast.remove(); }, 4800);
    }
    
    // ---------- API CONFIG (Google Sheets) ----------
    const CLASS_API_MAP = {
        nursery: "https://script.google.com/macros/s/AKfycbx0zvKqLXnX6M_C5PKKpltG65q9wPKpNkyxUMNNmQh1eP-1_jUo8jYsNmG2UZEimApf/exec",
        play: "https://script.google.com/macros/s/AKfycbxdbbpsW-7K-Dss2gQ-qM9mYBySZC5uhQLZAFOJQmjw1qDKi55RdIqQC0FmFuY90c0a/exec",
        kg: "https://script.google.com/macros/s/AKfycbxRn1Xw4AESJiWkN6XrZrYVls3-b_tB2fWUsSuPjaF3y0bQ7nK_fuUeoSluJ7YQl00/exec",
        class1: "https://script.google.com/macros/s/AKfycbwFRm5CdHuql7DMFIfIUsSfp-GA0nen2VZMX42wFycIUglZSaikzoZWUOGkakeK8mbA/exec",
        class2: "https://script.google.com/macros/s/AKfycbysc4CVbQkttE_BXiXZOLdKh81xxYC92BxQ0UueMaExAr3IJT5QXiVxqIghcgGFFgTe/exec",
        class3: "https://script.google.com/macros/s/AKfycbwL0Lj2Ow6EiN0U7oTPwK9xpvCLBm2PFvcu7CAZyB1BZ6pcN9GbmiAkky2ypl7GSrVb/exec",
        class4: "https://script.google.com/macros/s/AKfycbwXlGA6c-q8KuaEqAliXWCsSD5GN7G_WNPYIrECWGnt2byMlNkVF_Gi6J2hPXPo1V_w/exec",
        class5: "https://script.google.com/macros/s/AKfycbw4r0ADsGAHQngm9LGOQiXe6g10dsAqAAHotw2jkwUBMfHipm9IkfSIix91LEd64lEiIA/exec"
    };
    let currentApiUrl = null, currentActiveClassKey = null;
    
    function updateClassStatusUI() {
        const area = document.getElementById("classStatusArea");
        if(currentApiUrl && currentActiveClassKey) {
            let displayName = { nursery:"নার্সারি", play:"প্লে", kg:"কেজি", class1:"প্রথম শ্রেণি", class2:"দ্বিতীয় শ্রেণি", class3:"তৃতীয় শ্রেণি", class4:"চতুর্থ শ্রেণি", class5:"পঞ্চম শ্রেণি" }[currentActiveClassKey] || currentActiveClassKey;
            area.innerHTML = `<div style="background:#e9e0cf; border-radius:2rem; padding:0.4rem 1.2rem; color:#5d3a1a; font-weight:600;">✅ সক্রিয় ক্লাস: ${displayName}</div>`;
        } else area.innerHTML = `<div style="background:#ffe6cc; border-radius:2rem; padding:0.4rem 1rem;">⚠️ কোন সক্রিয় ক্লাস নেই। প্রথমে ক্লাস নির্বাচন করুন।</div>`;
    }
    
    async function callApi(action, payload) {
        if (!currentApiUrl) { showToast("প্রথমে ক্লাস নির্বাচন ও নিশ্চিত করুন!", "error"); throw new Error("No API"); }
        const res = await fetch(currentApiUrl, { method: "POST", body: JSON.stringify({ action, ...payload }) });
        return await res.json();
    }
    
    function activateClass(classKey){
        const url = CLASS_API_MAP[classKey]; if(!url) return false;
        currentApiUrl = url; currentActiveClassKey = classKey; localStorage.setItem("selectedClassKeyAdmit", classKey);
        updateClassStatusUI(); 
        showToast(`${classKey.toUpperCase()} ক্লাস সক্রিয়`,"success");
        return true;
    }
    
    document.getElementById("applyClassBtn").onclick = () => { const val = document.getElementById("classSelect").value; if(val) activateClass(val); else showToast("ক্লাস নির্বাচন করুন","warning"); };
    const saved = localStorage.getItem("selectedClassKeyAdmit");
    if(saved && CLASS_API_MAP[saved]) activateClass(saved); else updateClassStatusUI();
    
    // ---------- Image URLs & Teacher Signs ----------
    const logoURL = "https://res.cloudinary.com/do1dejkkk/image/upload/v1774935468/western_logo_hg9fji.png";
    const principalURL = "https://res.cloudinary.com/do1dejkkk/image/upload/v1776331870/principal_sign-removebg-preview_pj4jrj.png";
    const teacherSigns = {
        t1: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776881851/Gemini_Generated_Image_rkl605rkl605rkl6_nooehi_1_1_v9wgur.png",
        t2: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776573178/MUKTADIR_SIGN_bhyglf.png",
        t3: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776573178/MUKTADIR_SIGN_bhyglf.png"
    };
    let logoBase64, principalBase64, teacherBase64;
    
    // Helper: Convert image URL to Base64
    function toDataURL(url, cb) {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            const reader = new FileReader();
            reader.onloadend = function () {
                cb(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
    }
    
    // Load all required images before generating PDF
    function loadImages(selectedTeacher, done) {
        let loaded = 0;
        function checkDone() { loaded++; if (loaded === 3) done(); }
        toDataURL(logoURL, (l) => { logoBase64 = l; checkDone(); });
        toDataURL(principalURL, (p) => { principalBase64 = p; checkDone(); });
        toDataURL(teacherSigns[selectedTeacher], (t) => { teacherBase64 = t; checkDone(); });
    }
    
    // ---------- PDF Generation (Exact design from snippet) ----------
    function buildCardContent(student, examName, examDate, year) {
        if (!student.success) {
            return {
                stack: [
                    { image: logoBase64, width: 35, alignment: "center" },
                    { text: "Western School & College", alignment: "center", fontSize: 13, bold: true, margin: [0,2] },
                    { text: "ADMIT CARD | " + examDate, alignment: "center", fontSize: 9 },
                    { text: examName + " - " + year, alignment: "center", fontSize: 9, margin: [0,2] },
                    { text: " ", margin: [0,5] },
                    { text: `⚠️ Student ID: ${student.id} not found`, alignment: "center", fontSize: 10, color: "red", margin: [0,10] }
                ]
            };
        }
        const data = student.data;
        const studentName = data["Student Name"] || "N/A";
        const roll = data["Roll"] || "N/A";
        const className = data["Class"] || (currentActiveClassKey ? currentActiveClassKey.toUpperCase() : "N/A");
        const section = data["Section"] || "N/A";
        
        return {
            stack: [
                { image: logoBase64, width: 35, alignment: "center" },
                { text: "Western School & College", alignment: "center", fontSize: 13, bold: true, margin: [0,2] },
                { text: "ADMIT CARD | " + examDate, alignment: "center", fontSize: 9 },
                { text: examName + " - " + year, alignment: "center", fontSize: 9, margin: [0,2] },
                { text: " ", margin: [0,5] },
                {
                    table: {
                        widths: ["45%", "55%"],
                        body: [
                            ["Name", studentName],
                            ["Roll", roll],
                            ["Class", className],
                            ["Section", section]
                        ]
                    },
                    layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, paddingTop: () => 4, paddingBottom: () => 4 },
                    fontSize: 12
                },
                { text: " ", margin: [0,5] },
                {
                    table: {
                        widths: ["50%", "50%"],
                        body: [
                            [
                                { stack: [
                                    { image: teacherBase64, width: 55, alignment: "center" },
                                    { text: "Class Teacher", alignment: "center", fontSize: 10 }
                                ] },
                                { stack: [
                                    { image: principalBase64, width: 55, alignment: "center" },
                                    { text: "Principal", alignment: "center", fontSize: 10 }
                                ] }
                            ]
                        ]
                    },
                    layout: "noBorders",
                    margin: [0,10,0,0]
                }
            ]
        };
    }
    
    async function generatePDF(studentsData, examName, examDate) {
        const selectedTeacher = document.getElementById("teacherSelect").value;
        const year = new Date().getFullYear();
        
        // Load images first, then generate PDF
        loadImages(selectedTeacher, () => {
            // Prepare exactly 4 cards (fill missing with error cards)
            const finalCards = [];
            for (let i=0; i<4; i++) {
                if (i < studentsData.length) finalCards.push(studentsData[i]);
                else finalCards.push({ success: false, id: "—", error: "No ID provided" });
            }
            
            // Build the 2x2 table
            const tableBody = [
                [
                    buildCardContent(finalCards[0], examName, examDate, year),
                    buildCardContent(finalCards[1], examName, examDate, year)
                ],
                [
                    buildCardContent(finalCards[2], examName, examDate, year),
                    buildCardContent(finalCards[3], examName, examDate, year)
                ]
            ];
            
            const docDefinition = {
                pageSize: "A4",
                pageOrientation: "landscape",
                pageMargins: [8,8,8,8],
                content: [
                    {
                        table: {
                            widths: ["50%", "50%"],
                            body: tableBody
                        },
                        layout: {
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                            padding: () => 6
                        }
                    }
                ]
            };
            
            pdfMake.createPdf(docDefinition).download(`Admit_Cards_${examName.replace(/\s/g, '_')}.pdf`);
            showToast("PDF তৈরি হয়েছে!", "success");
        });
    }
    
    // ---------- Fetch student data from API ----------
    async function fetchAndGenerate() {
        if (!currentApiUrl) { showToast("ক্লাস সক্রিয় করুন প্রথমে!", "error"); return; }
        const examName = document.getElementById("examNameInput").value.trim() || "Mid Term Examination";
        const examDate = document.getElementById("examDateInput").value.trim() || "22-04-2026";
        const ids = [
            document.getElementById("studentId1").value.trim(),
            document.getElementById("studentId2").value.trim(),
            document.getElementById("studentId3").value.trim(),
            document.getElementById("studentId4").value.trim()
        ].filter(id => id !== "");
        if (ids.length === 0) { showToast("কমপক্ষে ১ জন শিক্ষার্থীর আইডি দিন", "warning"); return; }
        
        showToast(`${ids.length} জনের তথ্য সংগ্রহ করা হচ্ছে...`, "info");
        
        const fetchPromises = ids.map(async (id) => {
            try {
                const res = await callApi("getFullData", { id });
                if (res.status === "found" && res.basic) return { id, success: true, data: res.basic };
                else return { id, success: false, error: "শিক্ষার্থী পাওয়া যায়নি" };
            } catch (e) { return { id, success: false, error: "সার্ভার ত্রুটি" }; }
        });
        const results = await Promise.allSettled(fetchPromises);
        const studentsData = [];
        for (let i=0; i<results.length; i++) {
            const res = results[i].value;
            if (res && res.success) studentsData.push(res);
            else {
                const origId = ids[i];
                studentsData.push({ id: origId, success: false, error: res?.error || "অজানা ত্রুটি" });
            }
        }
        
        // Show preview
        const previewDiv = document.getElementById("studentInfoPreview");
        let previewHtml = `<h4>📋 সংগৃহীত তথ্য:</h4><table>`;
        for (let s of studentsData) {
            if (s.success) {
                previewHtml += `<tr><td>${s.id}</td><td>${s.data["Student Name"] || "নাম নেই"}</td><td>${s.data["Roll"] || "—"}</td></tr>`;
            } else {
                previewHtml += `<tr><td>${s.id}</td><td colspan="2" style="color:red;">${s.error}</td></tr>`;
            }
        }
        previewHtml += `</table><p>✅ ${studentsData.length}টি কার্ড তৈরি হবে (এক পৃষ্ঠায় ৪টি)।</p>`;
        previewDiv.innerHTML = previewHtml;
        previewDiv.style.display = "block";
        
        // Generate PDF
        await generatePDF(studentsData, examName, examDate);
    }
    
    document.getElementById("fetchAndGenerateBtn").onclick = () => fetchAndGenerate();
    document.getElementById("resetAdmitIdsBtn").onclick = () => {
        document.getElementById("studentId1").value = "";
        document.getElementById("studentId2").value = "";
        document.getElementById("studentId3").value = "";
        document.getElementById("studentId4").value = "";
        document.getElementById("studentInfoPreview").style.display = "none";
        showToast("আইডি ফিল্ড সাফ করা হয়েছে", "info");
    };