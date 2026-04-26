  // ========== MODERN TOAST FUNCTION ==========
  function showToast(message, type = "info") {
    const stack = document.getElementById("toastStack");
    const toast = document.createElement("div");
    let baseClass = "toast-message";
    if (type === "success") baseClass += " toast-success";
    else if (type === "error") baseClass += " toast-error";
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
      <button class="toast-close" aria-label="Close">
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    stack.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => toast.remove());
    
    setTimeout(() => {
      if (toast && toast.remove) toast.remove();
    }, 4500);
  }

  // ========== MODERN LOADER ==========
  const loaderOverlay = document.getElementById('modernLoader');
  function showLoader(show) {
    if (show) loaderOverlay.style.display = 'flex';
    else loaderOverlay.style.display = 'none';
  }

  // ========== ORIGINAL API ENDPOINTS (preserved) ==========
  const ACTION_API = "https://script.google.com/macros/s/AKfycbzQ1yJU0xqdQJxAg_Jj8yRSo7Z7vydfxK92ExvoKebbPYKTkbyQbjz1e20E50clXXFJtA/exec";
  const UPLOAD_API = "https://script.google.com/macros/s/AKfycbze4JtuYjfoFjaRV_XbaUfauB6BsmiDc0SpQK-bBzwgoexcqM9v3PRBg1xCRztWR2yMjQ/exec";
  const DASHBOARD_API = "https://script.google.com/macros/s/AKfycbxz7Y2IX0d7Gc6wOO7X1UEa_kDlb1AnbRQhtbnoIA5rPANL3yqZOqBq1xhEOZr6257qYg/exec";

  // run action (createSheet, sync, sendSMS)
  function run(action) {
    showLoader(true);
    fetch(ACTION_API + "?action=" + action)
      .then(r => r.text())
      .then(t => {
        document.getElementById("out").innerText = t;
        showToast(`✅ ${action} সম্পন্ন`, "success");
      })
      .catch(err => {
        document.getElementById("out").innerText = "⚠️ Request failed: " + err.message;
        showToast(`❌ ${action} ব্যর্থ: ${err.message}`, "error");
      })
      .finally(() => showLoader(false));
  }

  // file upload
  function uploadFile() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) {
      showToast("প্রথমে একটি TXT ফাইল নির্বাচন করুন", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;
      showLoader(true);
      fetch(UPLOAD_API, {
        method: "POST",
        body: content
      })
      .then(res => res.text())
      .then(data => {
        document.getElementById("status").innerText = data;
        showToast("ফাইল আপলোড সফল", "success");
      })
      .catch(err => {
        document.getElementById("status").innerText = "Error: " + (err.message || "Upload failed");
        showToast("আপলোড ব্যর্থ: " + err.message, "error");
      })
      .finally(() => showLoader(false));
    };
    reader.onerror = () => {
      showToast("ফাইল পড়তে সমস্যা", "error");
    };
    reader.readAsText(file);
  }

  // dashboard load
  function loadDashboard() {
    showLoader(true);
    fetch(DASHBOARD_API + "?mode=admin")
      .then(r => r.json())
      .then(d => {
        document.getElementById("sms").innerText = new Intl.NumberFormat('bn-BD').format(Math.round(d.total_sms_used || 0));
        document.getElementById("cost").innerText = "৳ " + new Intl.NumberFormat('bn-BD').format(d.sms_cost || 0);
        document.getElementById("rtk").innerText = "৳ " + new Intl.NumberFormat('bn-BD').format(d.total_recharge_tk || 0);
        document.getElementById("remtk").innerText = "৳ " + new Intl.NumberFormat('bn-BD').format(d.remaining_tk || 0);
        document.getElementById("remsms").innerText = new Intl.NumberFormat('bn-BD').format(Math.round(d.remaining_sms || 0));
        showToast("ড্যাশবোর্ড রিফ্রেশ করা হয়েছে", "success");
      })
      .catch(err => {
        console.warn(err);
        showToast("ড্যাশবোর্ড লোড ব্যর্থ", "error");
      })
      .finally(() => showLoader(false));
  }

  // recharge
  function recharge() {
    const amountInput = document.getElementById("amount");
    let amt = amountInput.value.trim();
    if (!amt || parseFloat(amt) <= 0) {
      showToast("সঠিক টাকার পরিমাণ লিখুন", "warning");
      return;
    }
    showLoader(true);
    fetch(DASHBOARD_API + "?mode=admin&amount=" + encodeURIComponent(amt))
      .then(() => {
        amountInput.value = "";
        showToast(`৳ ${amt} রিচার্জ সফল`, "success");
        return loadDashboard();
      })
      .catch(err => {
        showToast("রিচার্জ ব্যর্থ: " + err.message, "error");
      })
      .finally(() => showLoader(false));
  }

  // reset recharge
  function resetRecharge() {
    if (confirm("সব রিচার্জ ডাটা রিসেট করবেন? (অপারেশন অপরিবর্তনীয়)")) {
      showLoader(true);
      fetch(DASHBOARD_API + "?mode=admin&reset=true")
        .then(() => {
          showToast("রিসেট সম্পন্ন", "success");
          return loadDashboard();
        })
        .catch(err => {
          showToast("রিসেট ব্যর্থ", "error");
        })
        .finally(() => showLoader(false));
    }
  }

  // ========== ENTER KEY SHORTCUT for recharge field ==========
  function setupEnterKey() {
    const amountField = document.getElementById("amount");
    if (amountField) {
      amountField.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
          e.preventDefault();
          recharge();
        }
      });
    }
    const rechargeBtn = document.getElementById("rechargeBtn");
    if (rechargeBtn) {
      rechargeBtn.onclick = (e) => {
        e.preventDefault();
        recharge();
      };
    }
  }

  // ========== FILE INPUT DISPLAY UPDATE ==========
  const fileInputElem = document.getElementById("fileInput");
  const fileNameSpan = document.getElementById("fileNameDisplay");
  if (fileInputElem) {
    fileInputElem.addEventListener("change", function(e) {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        fileNameSpan.innerText = selectedFile.name.length > 35 ? selectedFile.name.slice(0, 32) + "..." : selectedFile.name;
        document.getElementById("status").innerText = "📄 আপলোডের জন্য প্রস্তুত '" + selectedFile.name + "'";
      } else {
        fileNameSpan.innerText = "কোনো ফাইল নির্বাচিত হয়নি";
        document.getElementById("status").innerText = "⏳ ফাইল আপলোডের অপেক্ষায়...";
      }
    });
  }

  // ========== INITIALIZE ==========
  document.addEventListener("DOMContentLoaded", function() {
    setupEnterKey();
    loadDashboard();
    // set default messages for action feedback
    if (document.getElementById("out").innerText === "") {
      document.getElementById("out").innerText = "💡 প্রস্তুত — যেকোনো অ্যাকশন ক্লিক করুন বা .txt ফাইল আপলোড করুন";
    }
  });

  // expose globally for inline onclick
  window.run = run;
  window.uploadFile = uploadFile;
  window.loadDashboard = loadDashboard;
  window.recharge = recharge;
  window.resetRecharge = resetRecharge;