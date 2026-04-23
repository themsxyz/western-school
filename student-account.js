    // ---------- TOAST & CONFIRM (updated classnames: account- prefixed) ----------
    function showToast(message, type = "info") {
        const root = document.getElementById("toastRoot");
        const toast = document.createElement("div");
        toast.className = `account-toast-message ${type === "success" ? "account-toast-success" : (type === "error" ? "account-toast-error" : "")}`;
        let icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
        toast.innerHTML = `<span>${icon}</span><span>${message}</span><span style="margin-left:auto; cursor:pointer;" onclick="this.parentElement.remove()">✕</span>`;
        root.appendChild(toast);
        setTimeout(() => { if(toast && toast.remove) toast.remove(); }, 4500);
    }

    function showConfirm(message) {
        return new Promise((resolve) => {
            const overlay = document.createElement("div");
            overlay.className = "account-confirm-overlay";
            overlay.innerHTML = `
                <div class="account-confirm-card">
                    <p style="font-size:1rem; margin-bottom:14px;">❓ ${message}</p>
                    <div style="display: flex; gap: 16px; justify-content: center;">
                        <button id="confirmYesBtn" style="background:#2f6b47;">হ্যাঁ</button>
                        <button id="confirmNoBtn" style="background:#9b7b5c;">না</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            const yesBtn = overlay.querySelector("#confirmYesBtn");
            const noBtn = overlay.querySelector("#confirmNoBtn");
            const cleanup = (result) => { overlay.remove(); resolve(result); };
            yesBtn.onclick = () => cleanup(true);
            noBtn.onclick = () => cleanup(false);
        });
    }
    window.alert = function(msg) { showToast(msg, "info"); };
    window.confirm = async function(msg) { return await showConfirm(msg); };
    
    // ---------- API ENDPOINTS ----------
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
    
    let currentApiUrl = null, currentActiveClassKey = null, currentStudent = null;
    
    const loader = document.getElementById("globalLoader");
    function showLoader() { loader.style.display = "flex"; }
    function hideLoader() { loader.style.display = "none"; }
    
    function resetAllUIContent() {
        document.getElementById("profileView").classList.add("account-hidden"); 
        document.getElementById("profileView").innerHTML = "";
        document.getElementById("searchId").value = "";
        document.getElementById("updateBtn").classList.add("account-hidden"); 
        document.getElementById("deleteStudentBtn").classList.add("account-hidden");
        currentStudent = null; 
        document.getElementById("formTitle").innerHTML = "➕ নতুন শিক্ষার্থী তৈরি";
        const fields = ["newId","newName","newRoll","newClass","newSection","newPhotoUrl","newDob","newBcn","newFname","newMname","newFnid","newMnid","newAddress","newPhone","newBlood"];
        fields.forEach(f => { let el = document.getElementById(f); if(el) el.value = ""; });
        document.getElementById("newPhotoFile").value = "";
    }
    
    function updateClassStatusUI() {
        const area = document.getElementById("classStatusArea");
        if(currentApiUrl && currentActiveClassKey) {
            let displayName = { nursery:"নার্সারি", play:"প্লে", kg:"কেজি", class1:"প্রথম শ্রেণি", class2:"দ্বিতীয় শ্রেণি", class3:"তৃতীয় শ্রেণি", class4:"চতুর্থ শ্রেণি", class5:"পঞ্চম শ্রেণি" }[currentActiveClassKey] || currentActiveClassKey;
            area.innerHTML = `<div style="background:#eef2ff; color:#1e3a5f;">✅ সক্রিয় ক্লাস: ${displayName}</div>`;
        } else area.innerHTML = `<div style="background:#f1f5f9; color:#475569;">⚠️ কোন সক্রিয় ক্লাস নেই। অনুগ্রহ করে ক্লাস নির্বাচন করুন।</div>`;
    }
    
    async function callApi(action, payload) {
        if (!currentApiUrl) { 
            showToast("প্রথমে ক্লাস নির্বাচন ও নিশ্চিত করুন!", "error"); 
            throw new Error("No API"); 
        }
        showLoader();
        try {
            const res = await fetch(currentApiUrl, { method: "POST", body: JSON.stringify({ action, ...payload }) });
            const data = await res.json();
            return data;
        } catch (err) { 
            showToast("নেটওয়ার্ক সমস্যা! ব্যাকএন্ড চেক করুন।", "error"); 
            throw err; 
        } finally {
            hideLoader();
        }
    }
    
    function fileToBase64(file) { 
        return new Promise((resolve, reject) => { 
            const reader = new FileReader(); 
            reader.readAsDataURL(file); 
            reader.onload = () => resolve(reader.result); 
            reader.onerror = reject; 
        }); 
    }
    
    function displayProfile(basic) {
        const container = document.getElementById("profileView"); 
        container.classList.remove("account-hidden");
        const photoUrl = basic["Photo URL"] || "";
        const photoHtml = photoUrl ? `<img src="${photoUrl}" class="account-profile-image">` : `<div class="account-profile-image" style="background:#e2e8f0; display:flex; align-items:center; justify-content:center; font-size:2rem;">📷</div>`;
        let infoHtml = `<div style="display:flex; gap:1.2rem; align-items:center; flex-wrap:wrap; margin-bottom:1rem;">${photoHtml}<h3 style="color:#1e3a5f;">${basic["Student Name"] || ""}</h3></div><div class="account-info-grid">`;
        for(let [k,v] of Object.entries(basic)) if(k!=="Photo URL") infoHtml += `<div><strong>${k}:</strong> ${v || '—'}</div>`;
        infoHtml += `</div>`; 
        container.innerHTML = infoHtml;
    }
    
    // ---------- SEARCH with ENTER shortkey ----------
    const searchInput = document.getElementById("searchId");
    const searchBtn = document.getElementById("searchBtn");
    
    async function handleSearch() {
        if(!currentApiUrl){ showToast("ক্লাস সক্রিয় করুন","error"); return; }
        const id = document.getElementById("searchId").value.trim(); 
        if(!id) { showToast("আইডি দিন","warning"); return; }
        try {
            const res = await callApi("getFullData", { id });
            if(res.status==="found") {
                currentStudent = res; 
                displayProfile(res.basic);
                document.getElementById("updateBtn").classList.remove("account-hidden"); 
                document.getElementById("deleteStudentBtn").classList.remove("account-hidden");
                document.getElementById("formTitle").innerHTML = "✏️ শিক্ষার্থী সম্পাদনা";
                const b = res.basic;
                document.getElementById("newId").value = id; 
                document.getElementById("newName").value = b["Student Name"]||""; 
                document.getElementById("newRoll").value = b["Roll"]||"";
                document.getElementById("newClass").value = b["Class"]||""; 
                document.getElementById("newSection").value = b["Section"]||""; 
                document.getElementById("newPhotoUrl").value = b["Photo URL"]||"";
                document.getElementById("newDob").value = b["Date of birth"]||""; 
                document.getElementById("newBcn").value = b["Birth registration number"]||"";
                document.getElementById("newFname").value = b["Father's name"]||""; 
                document.getElementById("newMname").value = b["Mother's name"]||"";
                document.getElementById("newFnid").value = b["Father's NID"]||""; 
                document.getElementById("newMnid").value = b["Mother's NID"]||"";
                document.getElementById("newAddress").value = b["Address"]||""; 
                document.getElementById("newPhone").value = b["Phone number"]||""; 
                document.getElementById("newBlood").value = b["Blood group"]||"";
            } else { 
                showToast("শিক্ষার্থী পাওয়া যায়নি","error"); 
                resetAllUIContent(); 
            }
        } catch(e) { console.warn(e); }
    }
    
    searchBtn.onclick = handleSearch;
    searchInput.addEventListener("keypress", function(e) {
        if(e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    });
    
    // Create student
    document.getElementById("createBtn").onclick = async () => {
        if(!currentApiUrl){ showToast("ক্লাস সক্রিয় করুন","error"); return; }
        const id = document.getElementById("newId").value.trim(); 
        if(!id) return showToast("আইডি প্রয়োজন","warning");
        let photoBase64 = null; 
        const file = document.getElementById("newPhotoFile").files[0]; 
        if(file) photoBase64 = await fileToBase64(file);
        const payload = { id, name:document.getElementById("newName").value, roll:document.getElementById("newRoll").value, class:document.getElementById("newClass").value, section:document.getElementById("newSection").value,
            photoUrl:document.getElementById("newPhotoUrl").value, photoBase64, dob:document.getElementById("newDob").value, bcn:document.getElementById("newBcn").value,
            fname:document.getElementById("newFname").value, mname:document.getElementById("newMname").value, fnid:document.getElementById("newFnid").value, mnid:document.getElementById("newMnid").value,
            address:document.getElementById("newAddress").value, phone:document.getElementById("newPhone").value, blood:document.getElementById("newBlood").value };
        try {
            const res = await callApi("create", payload);
            if(res.status==="created") { showToast("শিক্ষার্থী সফলভাবে তৈরি!","success"); resetAllUIContent(); } 
            else showToast(res.message || "ত্রুটি","error");
        } catch(e) {}
    };
    
    // Update
    document.getElementById("updateBtn").onclick = async () => {
        if(!currentApiUrl||!currentStudent){ showToast("প্রথমে শিক্ষার্থী লোড করুন","error"); return; }
        const id = document.getElementById("newId").value.trim(); 
        if(!id) return;
        let photoBase64 = null; 
        const file = document.getElementById("newPhotoFile").files[0]; 
        if(file) photoBase64 = await fileToBase64(file);
        const payload = { id, name:document.getElementById("newName").value, roll:document.getElementById("newRoll").value, class:document.getElementById("newClass").value, section:document.getElementById("newSection").value,
            photoUrl:document.getElementById("newPhotoUrl").value, photoBase64, dob:document.getElementById("newDob").value, bcn:document.getElementById("newBcn").value,
            fname:document.getElementById("newFname").value, mname:document.getElementById("newMname").value, fnid:document.getElementById("newFnid").value, mnid:document.getElementById("newMnid").value,
            address:document.getElementById("newAddress").value, phone:document.getElementById("newPhone").value, blood:document.getElementById("newBlood").value };
        try {
            const res = await callApi("updateBasic", payload);
            if(res.status==="updated"){ showToast("হালনাগাদ সফল","success"); handleSearch(); } 
            else showToast("আপডেট ব্যর্থ","error");
        } catch(e) {}
    };
    
    // Delete
    document.getElementById("deleteStudentBtn").onclick = async () => {
        if(!currentApiUrl) return;
        const id = document.getElementById("searchId").value.trim();
        if(!id) return;
        if(await showConfirm("স্থায়ীভাবে মুছে ফেলতে চান?")) { 
            try {
                const res = await callApi("delete", { id }); 
                if(res.status==="deleted"){ showToast("মুছে ফেলা হয়েছে","success"); resetAllUIContent(); } 
                else showToast("ত্রুটি","error");
            } catch(e) {}
        }
    };
    
    // class activation
    function activateClass(classKey){
        const url = CLASS_API_MAP[classKey]; 
        if(!url) return false;
        currentApiUrl = url; 
        currentActiveClassKey = classKey; 
        localStorage.setItem("selectedClassKey", classKey);
        updateClassStatusUI(); 
        resetAllUIContent(); 
        showToast(`${classKey.toUpperCase()} ক্লাস সক্রিয়`,"success");
        return true;
    }
    
    document.getElementById("applyClassBtn").onclick = () => { 
        const val = document.getElementById("classSelect").value; 
        if(val) activateClass(val); 
        else showToast("ক্লাস নির্বাচন করুন","warning"); 
    };
    
    document.getElementById("clearUiBtn").onclick = async () => { 
        if(await showConfirm("সমস্ত UI ডাটা সাফ করবেন? (শিক্ষার্থী ফর্ম ও অনুসন্ধান রিসেট হবে)")) resetAllUIContent(); 
    };
    
    // auto capitalize & phone digits
    document.getElementById("newName").addEventListener("input", function(e){ 
        let words = e.target.value.split(" "); 
        this.value = words.map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(" "); 
    });
    document.getElementById("newPhone").addEventListener("input", function(){ 
        this.value = this.value.replace(/\D/g, '').slice(0,11); 
    });
    
    // ---------- DEFAULT NO CLASS SELECTION ----------
    currentApiUrl = null;
    currentActiveClassKey = null;
    currentStudent = null;
    const savedClass = localStorage.getItem("selectedClassKey");
    if(savedClass && CLASS_API_MAP[savedClass]) {
        document.getElementById("classSelect").value = savedClass;
    } else {
        document.getElementById("classSelect").selectedIndex = 0;
    }
    updateClassStatusUI();
    resetAllUIContent();