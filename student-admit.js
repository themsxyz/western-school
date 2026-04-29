 // ---------- NEW GLASS TOAST ----------
    const toastElement = document.getElementById('glassToast');
    const toastMessageSpan = toastElement.querySelector('.toast-message');
    const toastIconSvg = toastElement.querySelector('.toast-icon svg');
    let toastTimeout = null;

    function showToast(message, type = 'info') {
        if (toastTimeout) clearTimeout(toastTimeout);
        // set icon based on type
        let iconPath = '';
        if (type === 'success') {
            iconPath = '<circle cx="12" cy="12" r="10"/><polyline points="18 8 12 16 8 12"/>';
        } else if (type === 'error') {
            iconPath = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
        } else {
            iconPath = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
        }
        toastIconSvg.innerHTML = iconPath;
        toastMessageSpan.textContent = message;
        toastElement.classList.remove('show');
        void toastElement.offsetWidth; // force reflow
        toastElement.classList.add('show');
        toastTimeout = setTimeout(() => {
            toastElement.classList.remove('show');
        }, 4000);
    }
    const closeToastBtn = toastElement.querySelector('.toast-close');
    closeToastBtn.addEventListener('click', () => {
        toastElement.classList.remove('show');
        if (toastTimeout) clearTimeout(toastTimeout);
    });
    
    // ---------- LOADER FUNCTIONS ----------
    const loaderOverlay = document.getElementById('globalLoader');
    function showLoader() { if (loaderOverlay) loaderOverlay.style.display = 'flex'; }
    function hideLoader() { if (loaderOverlay) loaderOverlay.style.display = 'none'; }
    
    // ---------- API CONFIG (Google Sheets) ----------
  const CLASS_API_MAP = {
        nursery: "https://script.google.com/macros/s/AKfycbyTF_85aIdiEnNm_q9Tne-fIDqWI1XVX82GDIdyqz1CvBxpG7f95nIWm6IAFBXOe-Mf/exec",
        play: "https://script.google.com/macros/s/AKfycbyyGjmPF3ymWXpbaBsp86jlBfVF_NL8QR1FSGBcYugkk-ql9B_l2jIlBdY49kKz0bnP/exec",
        kg: "https://script.google.com/macros/s/AKfycbzT9Y9p3pzzcfvB2NhjKYK7VZwW5oI9cnP6liXpEj8GwMdmGHRUW_urobQub6ftDLIV/exec",
        class1: "https://script.google.com/macros/s/AKfycbxip3LS8e6t9lou6SIK0JsOh4WmUodi_oicpmNaYqUoHii7wwg2LMG9IMLKhSShI0Ve/exec",
        class2: "https://script.google.com/macros/s/AKfycbzsN8qTTagmSfkf5m0EWeUQDXrLMRA5-lUFYyypd7ih5Onb5wT0QedBjoHoGCRB395iUg/exec",
        class3: "https://script.google.com/macros/s/AKfycbx6Wlrh2V5823dpApgkhfiuX-a6WhzcQJ9PkI7GHuMiNnRlvuUJG-RXDzDG6B6A1gbo/exec",
        class4: "https://script.google.com/macros/s/AKfycbyAZkQoX8mY8YQyKvhRthwg4Ij02PFbw_z67w_CdShpfmPY8qgkO6ueMyeegXlRtuMG/exec",
        class5: "https://script.google.com/macros/s/AKfycbxxLrztdhv7O_uFHT1PHZlPNmF600tc6huT1PTA-M-o1OrE9JFtCpKuq3fuToGL6haEqQ/exec"
    };
    let currentApiUrl = null, currentActiveClassKey = null;
    
    function updateClassStatusUI() {
        const area = document.getElementById("classStatusArea");
        if(currentApiUrl && currentActiveClassKey) {
            let displayName = { nursery:"Nursery", play:"Play", kg:"KG", class1:"Class 1", class2:"Class 2", class3:"Class 3", class4:"Class 4", class5:"Class 5" }[currentActiveClassKey] || currentActiveClassKey;
            area.innerHTML = `<div style="background:#e9e0cf; border-radius:2rem; padding:0.4rem 1.2rem; color:#5d3a1a; font-weight:600;">✅ Active Class: ${displayName}</div>`;
        } else area.innerHTML = `<div style="background:#ffe6cc; border-radius:2rem; padding:0.4rem 1rem;">⚠️ No active class. Please select a class first.</div>`;
    }
    
    async function callApi(action, payload) {
        if (!currentApiUrl) { showToast("Please select and confirm a class first!", "error"); throw new Error("No API"); }
        const res = await fetch(currentApiUrl, { method: "POST", body: JSON.stringify({ action, ...payload }) });
        return await res.json();
    }
    
    function activateClass(classKey){
        const url = CLASS_API_MAP[classKey]; if(!url) return false;
        currentApiUrl = url; currentActiveClassKey = classKey; localStorage.setItem("selectedClassKeyAdmit", classKey);
        updateClassStatusUI(); 
        showToast(`${classKey.toUpperCase()} class activated`,"success");
        return true;
    }
    
    document.getElementById("applyClassBtn").onclick = () => { const val = document.getElementById("classSelect").value; if(val) activateClass(val); else showToast("Please select a class","warning"); };
    const saved = localStorage.getItem("selectedClassKeyAdmit");
    if(saved && CLASS_API_MAP[saved]) activateClass(saved); else updateClassStatusUI();
    
    // ---------- 10 TEACHERS WITH ENGLISH NAMES & SIGNATURE URLs ----------
    const teachersList = [
        { id: "t1", name: "Mr. Abdur Rahman", sign: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776881851/Gemini_Generated_Image_rkl605rkl605rkl6_nooehi_1_1_v9wgur.png" },
        { id: "t2", name: "Ms. Fatema Begum", sign: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776573178/MUKTADIR_SIGN_bhyglf.png" },
        { id: "t3", name: "Mr. Jamal Uddin", sign: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776573178/MUKTADIR_SIGN_bhyglf.png" },
        { id: "t4", name: "Ms. Nasrin Sultana", sign: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776573178/MUKTADIR_SIGN_bhyglf.png" },
        { id: "t5", name: "Mr. Kamal Hossain", sign: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776881851/Gemini_Generated_Image_rkl605rkl605rkl6_nooehi_1_1_v9wgur.png" },
        { id: "t6", name: "Ms. Sheli Akter", sign: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776573178/MUKTADIR_SIGN_bhyglf.png" },
        { id: "t7", name: "Mr. Rafiqul Islam", sign: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776881851/Gemini_Generated_Image_rkl605rkl605rkl6_nooehi_1_1_v9wgur.png" },
        { id: "t8", name: "Ms. Sabrina Chowdhury", sign: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776573178/MUKTADIR_SIGN_bhyglf.png" },
        { id: "t9", name: "Mr. Shahinur Rahman", sign: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776881851/Gemini_Generated_Image_rkl605rkl605rkl6_nooehi_1_1_v9wgur.png" },
        { id: "t10", name: "Ms. Rumana Khatun", sign: "https://res.cloudinary.com/do1dejkkk/image/upload/v1776573178/MUKTADIR_SIGN_bhyglf.png" }
    ];
    
    let selectedTeacherId = "t1";
    
    function renderTeacherGrid() {
        const gridContainer = document.getElementById("teacherGrid");
        if(!gridContainer) return;
        gridContainer.innerHTML = "";
        teachersList.forEach(teacher => {
            const btn = document.createElement("div");
            btn.className = `teacher-option ${selectedTeacherId === teacher.id ? 'active' : ''}`;
            btn.setAttribute("data-id", teacher.id);
            btn.innerHTML = `<img src="${teacher.sign}" class="teacher-preview-img" alt="sign" onerror="this.style.display='none'"> <span>${teacher.name}</span>`;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".teacher-option").forEach(el => el.classList.remove("active"));
                btn.classList.add("active");
                selectedTeacherId = teacher.id;
                document.getElementById("selectedTeacherKey").value = teacher.id;
                showToast(`Teacher selected: ${teacher.name}`, "success");
                window.currentTeacherSignUrl = teacher.sign;
            });
            gridContainer.appendChild(btn);
        });
    }
    renderTeacherGrid();
    
    const logoURL = "https://res.cloudinary.com/do1dejkkk/image/upload/v1774935468/western_logo_hg9fji.png";
    const principalURL = "https://res.cloudinary.com/do1dejkkk/image/upload/v1776331870/principal_sign-removebg-preview_pj4jrj.png";
    
    let logoBase64 = null, principalBase64 = null, teacherBase64 = null;
    let currentTeacherSignUrl = teachersList.find(t => t.id === "t1")?.sign;
    
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
    
    function loadImages(selectedTeacherSignUrl, done) {
        let loaded = 0;
        function checkDone() { 
            loaded++; 
            if (loaded === 3) done(); 
        }
        if(logoBase64 && principalBase64) {
            toDataURL(selectedTeacherSignUrl, (t) => { teacherBase64 = t; checkDone(); checkDone(); });
            loaded = 2;
            checkDone();
            return;
        }
        toDataURL(logoURL, (l) => { logoBase64 = l; checkDone(); });
        toDataURL(principalURL, (p) => { principalBase64 = p; checkDone(); });
        toDataURL(selectedTeacherSignUrl, (t) => { teacherBase64 = t; checkDone(); });
    }
    
    function buildCardContent(student, examName, examDate, year, teacherSignImg) {
        if (!student.success) {
            return {
                stack: [
                    { image: logoBase64, width: 35, alignment: "center" },
                    { text: "Western School & College", alignment: "center", fontSize: 13, bold: true, margin: [0,2] },
                    { text: "ADMIT CARD | " + examDate, alignment: "center", fontSize: 9 },
                    { text: examName + " - " + year, alignment: "center", fontSize: 9, margin: [0,2] },
                    { text: " ", margin: [0,5] },
                    { text: `⚠️ Student ID: ${student.id} পাওয়া যাইনি`, alignment: "center", fontSize: 10, color: "red", margin: [0,10] }
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
                                    { image: teacherSignImg, width: 55, alignment: "center" },
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
        return new Promise((resolve, reject) => {
            const selectedTeacherObj = teachersList.find(t => t.id === selectedTeacherId);
            const teacherSignUrl = selectedTeacherObj ? selectedTeacherObj.sign : teachersList[0].sign;
            currentTeacherSignUrl = teacherSignUrl;
            
            loadImages(teacherSignUrl, () => {
                const year = new Date().getFullYear();
                const finalCards = [];
                for (let i=0; i<4; i++) {
                    if (i < studentsData.length) finalCards.push(studentsData[i]);
                    else finalCards.push({ success: false, id: "—", error: "No ID provided" });
                }
                const teacherSignImg = teacherBase64;
                const tableBody = [
                    [
                        buildCardContent(finalCards[0], examName, examDate, year, teacherSignImg),
                        buildCardContent(finalCards[1], examName, examDate, year, teacherSignImg)
                    ],
                    [
                        buildCardContent(finalCards[2], examName, examDate, year, teacherSignImg),
                        buildCardContent(finalCards[3], examName, examDate, year, teacherSignImg)
                    ]
                ];
                const docDefinition = {
                    pageSize: "A4",
                    pageOrientation: "landscape",
                    pageMargins: [10,10,10,10],
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
                showToast("Admit card তৈরি হয়েছে", "success");
                resolve();
            });
        });
    }
    
    async function fetchAndGenerate() {
        if (!currentApiUrl) { showToast("Please activate a class first!", "error"); return; }
        const examName = document.getElementById("examNameInput").value.trim() || "Mid Term Examination";
        const examDate = document.getElementById("examDateInput").value.trim() || "22-04-2026";
        const ids = [
            document.getElementById("studentId1").value.trim(),
            document.getElementById("studentId2").value.trim(),
            document.getElementById("studentId3").value.trim(),
            document.getElementById("studentId4").value.trim()
        ].filter(id => id !== "");
        if (ids.length === 0) { showToast("দয়া করে ছাত্র আইডি যোগ করুন", "warning"); return; }
        
        showLoader();
        try {
            showToast(`Fetching data for ${ids.length} student(s)...`, "info");
            const fetchPromises = ids.map(async (id) => {
                try {
                    const res = await callApi("getFullData", { id });
                    if (res.status === "found" && res.basic) return { id, success: true, data: res.basic };
                    else return { id, success: false, error: "ছাত্র পাওয়া যাইনি" };
                } catch (e) { return { id, success: false, error: "সার্ভার সমস্যা!" }; }
            });
            const results = await Promise.allSettled(fetchPromises);
            const studentsData = [];
            for (let i=0; i<results.length; i++) {
                const res = results[i].value;
                if (res && res.success) studentsData.push(res);
                else {
                    const origId = ids[i];
                    studentsData.push({ id: origId, success: false, error: res?.error || "Unknown error" });
                }
            }
            const previewDiv = document.getElementById("studentInfoPreview");
            let previewHtml = `<h4>📋 Collected Data (Selected Teacher: ${teachersList.find(t=>t.id===selectedTeacherId)?.name}):</h4>`;
            previewHtml += `<td><thead><tr><th>ID</th><th>Name</th><th>Roll</th><th>Status</th></tr></thead><tbody>`;
            for (let s of studentsData) {
                if (s.success) {
                    previewHtml += `<tr><td>${s.id}</td><td>${s.data["Student Name"] || "N/A"}</td><td>${s.data["Roll"] || "—"}</td><td style="color:green;">✅ পাওয়া গেছে!</td></tr>`;
                } else {
                    previewHtml += `<tr><td>${s.id}</td><td colspan="2" style="color:red;">${s.error}</td><td style="color:red;">❌পাওয়া যাইনি</td></tr>`;
                }
            }
            previewHtml += `</tbody></table><p>✅ ${studentsData.filter(s=>s.success).length} valid card(s) will be generated (4 per page) &nbsp; 👩‍🏫 Teacher signature included.</p>`;
            previewDiv.innerHTML = previewHtml;
            previewDiv.style.display = "block";
            await generatePDF(studentsData, examName, examDate);
        } catch (err) {
            console.error(err);
            showToast("An error occurred while generating admit card", "error");
        } finally {
            hideLoader();
        }
    }
    
    document.getElementById("fetchAndGenerateBtn").onclick = () => fetchAndGenerate();
    document.getElementById("resetAdmitIdsBtn").onclick = () => {
        document.getElementById("studentId1").value = "";
        document.getElementById("studentId2").value = "";
        document.getElementById("studentId3").value = "";
        document.getElementById("studentId4").value = "";
        document.getElementById("studentInfoPreview").style.display = "none";
        showToast("ID fields cleared", "info");
    };
    
    window.addEventListener("load", () => {
        const activeTeacher = teachersList.find(t => t.id === selectedTeacherId);
        if(activeTeacher) currentTeacherSignUrl = activeTeacher.sign;
    });
