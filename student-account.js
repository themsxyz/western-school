// ---------- GLASS TOAST FUNCTION (replaces old toast) ----------
const toastElement = document.getElementById('glassToast');
const toastMessageSpan = toastElement.querySelector('.toast-message');
const toastIcon = toastElement.querySelector('.toast-icon svg');
let toastTimeout = null;

function showToast(message, type = 'info') {
    if (toastTimeout) clearTimeout(toastTimeout);

    let iconPath = '';
    if (type === 'success') {
        iconPath = '<circle cx="12" cy="12" r="10"/><polyline points="18 8 12 16 8 12"/>';
    } else if (type === 'error') {
        iconPath = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
    } else {
        iconPath = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
    }

    toastIcon.innerHTML = iconPath;
    toastMessageSpan.textContent = message;

    toastElement.classList.remove('show');
    void toastElement.offsetWidth;
    toastElement.classList.add('show');

    toastTimeout = setTimeout(() => {
        toastElement.classList.remove('show');
    }, 4000);
}

// Close button event
const closeBtn = toastElement.querySelector('.toast-close');
closeBtn.addEventListener('click', () => {
    toastElement.classList.remove('show');
    if (toastTimeout) clearTimeout(toastTimeout);
});

// Override default alert
window.alert = function(msg) {
    showToast(msg, 'info');
};

// ---------- CONFIRM (unchanged) ----------
function showConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "account-confirm-overlay";
        overlay.innerHTML = `
            <div class="account-confirm-card">
                <p style="font-size:1rem; margin-bottom:14px;">❓ ${message}</p>
                <div style="display: flex; gap: 16px; justify-content: center;">
                    <button id="confirmYesBtn" style="background:#2f6b47; border-radius:999px; padding:6px 16px;">হ্যাঁ</button>
                    <button id="confirmNoBtn" style="background:#9b7b5c; border-radius:999px; padding:6px 16px;">না</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const yesBtn = overlay.querySelector("#confirmYesBtn");
        const noBtn = overlay.querySelector("#confirmNoBtn");

        const cleanup = (result) => {
            overlay.remove();
            resolve(result);
        };

        yesBtn.onclick = () => cleanup(true);
        noBtn.onclick = () => cleanup(false);
    });
}

window.confirm = async function(msg) {
    return await showConfirm(msg);
};

// ---------- LOADER ----------
const loaderOverlay = document.getElementById("globalLoader");

function showLoader() {
    if (loaderOverlay) loaderOverlay.style.display = "flex";
}

function hideLoader() {
    if (loaderOverlay) loaderOverlay.style.display = "none";
};

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

let currentApiUrl = null;
let currentActiveClassKey = null;
let currentStudent = null;

// ---------- RESET UI ----------
function resetAllUIContent() {
    document.getElementById("profileView").classList.add("account-hidden");
    document.getElementById("profileView").innerHTML = "";
    document.getElementById("searchId").value = "";
    document.getElementById("updateBtn").classList.add("account-hidden");
    document.getElementById("deleteStudentBtn").classList.add("account-hidden");

    currentStudent = null;

    document.getElementById("formTitle").innerHTML = "➕ নতুন শিক্ষার্থী তৈরি";

    const fields = [
        "newId","newName","newRoll","newClass","newSection",
        "newPhotoUrl","newDob","newBcn","newFname","newMname",
        "newFnid","newMnid","newAddress","newPhone","newBlood"
    ];

    fields.forEach(f => {
        let el = document.getElementById(f);
        if (el) el.value = "";
    });

    document.getElementById("newPhotoFile").value = "";
}

// ---------- 🔥 ONLY ADDITION: CLASS AUTO SYNC ----------
document.getElementById("classSelect").addEventListener("change", function () {
    const form = document.getElementById("newClass");
    if (form) form.value = this.value;
});

document.getElementById("newClass").addEventListener("change", function () {
    const top = document.getElementById("classSelect");
    if (this.value && top) top.value = this.value;
});

// ---------- CLASS STATUS ----------
function updateClassStatusUI() {
    const area = document.getElementById("classStatusArea");

    if (currentApiUrl && currentActiveClassKey) {
        let displayName = {
            nursery:"নার্সারি",
            play:"প্লে",
            kg:"কেজি",
            class1:"প্রথম শ্রেণি",
            class2:"দ্বিতীয় শ্রেণি",
            class3:"তৃতীয় শ্রেণি",
            class4:"চতুর্থ শ্রেণি",
            class5:"পঞ্চম শ্রেণি"
        }[currentActiveClassKey] || currentActiveClassKey;

        area.innerHTML = `✅ সক্রিয় ক্লাস: ${displayName}`;
    } else {
        area.innerHTML = `⚠️ কোন সক্রিয় ক্লাস নেই।`;
    }
}

// ---------- API CALL ----------
async function callApi(action, payload) {
    if (!currentApiUrl) {
        showToast("ক্লাস নির্বাচন করুন","error");
        throw new Error("No API");
    }

    try {
        const res = await fetch(currentApiUrl, {
            method: "POST",
            body: JSON.stringify({ action, ...payload })
        });

        return await res.json();
    } catch (err) {
        showToast("নেটওয়ার্ক সমস্যা","error");
        throw err;
    }
}

// ---------- CLASS ACTIVATE (ONLY ADDITION INSIDE) ----------
function activateClass(classKey){
    const url = CLASS_API_MAP[classKey];
    if(!url) return false;

    currentApiUrl = url;
    currentActiveClassKey = classKey;

    localStorage.setItem("selectedClassKey", classKey);

    updateClassStatusUI();
    resetAllUIContent();

    // 🔥 IMPORTANT ADD
    document.getElementById("newClass").value = classKey;

    showToast(`${classKey.toUpperCase()} ক্লাস সক্রিয়`,"success");
    return true;
}

// ---------- INIT ----------
let savedClass = localStorage.getItem("selectedClassKey");
if(savedClass && CLASS_API_MAP[savedClass]){
    document.getElementById("classSelect").value = savedClass;
}

updateClassStatusUI();
resetAllUIContent();
