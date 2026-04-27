  // ========================
  // API কনফিগারেশন (একই গুগল স্ক্রিপ্ট)
  // ========================
  const BASE_URL = "https://script.google.com/macros/s/AKfycbzm3NpGmkqEefVmnyDxIKZLmcVxCdKV03fDUp3tDhy6sEgM5xYzm2R_irbwij4s70m8bQ/exec";

  // ========================
  // মডার্ন লোডার কন্ট্রোল
  // ========================
  const loaderOverlay = document.getElementById('modernLoader');
  function showLoader(show, customText = "প্রক্রিয়াধীন...") {
    if (show) {
      const loaderText = loaderOverlay.querySelector('.loader-text');
      if (loaderText) loaderText.innerText = customText;
      loaderOverlay.style.display = 'flex';
    } else {
      loaderOverlay.style.display = 'none';
    }
  }

  // ========================
  // গ্লাস টোস্ট নোটিফিকেশন (বাংলা বার্তা)
  // ========================
  function showToast(message, type = "info") {
    const stack = document.getElementById("toastStack");
    const toast = document.createElement("div");
    let baseClass = "toast-message";
    if (type === "success") baseClass += " toast-success";
    else if (type === "error") baseClass += " toast-error";
    toast.className = baseClass;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="18 8 12 16 8 12"/>
                 </svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                 </svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                 </svg>`;
    }
    
    toast.innerHTML = `
      ${iconSvg}
      <span style="flex:1;">${message}</span>
      <button class="toast-close" aria-label="বন্ধ করুন">
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

  // ========================
  // স্ট্যাটাস আপডেট (ড্যাশবোর্ডের ভিতরে)
  // ========================
  function setStatus(msg, isError = false) {
    const statusDiv = document.getElementById("statusMessage");
    if (statusDiv) {
      statusDiv.innerHTML = isError ? `⚠️ ${msg}` : `✅ ${msg}`;
      if (isError) {
        statusDiv.style.background = "rgba(239, 68, 68, 0.2)";
        statusDiv.style.borderLeft = "3px solid #ef4444";
      } else {
        statusDiv.style.background = "rgba(255, 255, 255, 0.5)";
        statusDiv.style.borderLeft = "none";
      }
    }
  }

  // ========================
  // ইউনিভার্সাল এপিআই কল (লোডারসহ)
  // ========================
  async function callApi(action, showSuccessToast = true) {
    showLoader(true, `${getBanglaActionText(action)} হচ্ছে...`);
    try {
      const response = await fetch(`${BASE_URL}?action=${action}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      setStatus(`${getBanglaActionText(action)} সম্পন্ন: ${text.substring(0, 100)}`);
      if (showSuccessToast) {
        showToast(`${getBanglaActionText(action)} সফল হয়েছে`, "success");
      }
      return text;
    } catch (err) {
      console.error(err);
      setStatus(`${getBanglaActionText(action)} এর সময় ত্রুটি: ${err.message}`, true);
      showToast(`${getBanglaActionText(action)} ব্যর্থ: ${err.message}`, "error");
      throw err;
    } finally {
      showLoader(false);
    }
  }

  function getBanglaActionText(action) {
    const map = {
      createSheet: "শীট তৈরি ও লোড",
      sync: "সিঙ্ক",
      sendSMS: "এসএমএস পাঠানো",
      clearData: "তথ্য মুছে ফেলা",
      getData: "তথ্য সংগ্রহ"
    };
    return map[action] || action;
  }

  // ========================
  // গুগল শীট থেকে ডেটা লোড (getData)
  // ========================
  async function loadData() {
    showLoader(true, "তথ্য আনা হচ্ছে...");
    try {
      const response = await fetch(`${BASE_URL}?action=getData`);
      if (!response.ok) throw new Error("সার্ভার উত্তর দেয়নি");
      const data = await response.json();
      
      const tbody = document.getElementById("tbody");
      tbody.innerHTML = "";
      
      if (!data || data.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.className = "empty-row";
        emptyRow.innerHTML = '<td colspan="5">📭 কোন রেকর্ড নেই। "শীট লোড করুন" বা সিঙ্ক অপশন ব্যবহার করুন</td>';
        tbody.appendChild(emptyRow);
        setStatus("ডেটা লোড: ০টি সারি");
        showToast("কোন ডেটা পাওয়া যায়নি", "info");
        return;
      }
      
      data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(row.number || '—')}</td>
          <td>${escapeHtml(row.name || '—')}</td>
          <td>${escapeHtml(row.class || '—')}</td>
          <td>${escapeHtml(row.datetime || '—')}</td>
          <td>${escapeHtml(row.status || '—')}</td>
        `;
        tbody.appendChild(tr);
      });
      
      setStatus(`ডেটা লোড সফল: ${data.length}টি রেকর্ড`);
      showToast(`${data.length}টি তথ্য সফলভাবে দেখানো হয়েছে`, "success");
    } catch (err) {
      console.error(err);
      setStatus(`লোড করতে ব্যর্থ: ${err.message}`, true);
      showToast(`তথ্য লোড ব্যর্থ: ${err.message}`, "error");
      document.getElementById("tbody").innerHTML = '<tr class="empty-row"><td colspan="5">⚠️ সংযোগ সমস্যা, আবার চেষ্টা করুন।</td></tr>';
    } finally {
      showLoader(false);
    }
  }

  // HTML এস্কেপ ফাংশন
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // ========================
  // একশন হ্যান্ডলার (বাংলা কনফার্মেশন ও টোস্ট)
  // ========================
  async function createSheetAction() {
    await callApi("createSheet");
    await loadData();
  }

  async function syncAction() {
    await callApi("sync");
    await loadData();
  }

  async function sendSmsAction() {
    await callApi("sendSMS");
    await loadData();
  }

  async function clearDataAction() {
    // বাংলায় কনফার্মেশন ডায়লগ
    const userConfirmed = confirm("⚠️ সতর্কতা: সব এসএমএস রেকর্ড স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?");
    if (!userConfirmed) {
      showToast("অপারেশন বাতিল করা হয়েছে", "info");
      return;
    }
    try {
      await callApi("clearData");
      await loadData();
      showToast("সকল তথ্য মুছে ফেলা হয়েছে", "success");
    } catch(e) {
      showToast("মুছতে ব্যর্থ: "+e.message, "error");
    }
  }

  // ========================
  // এন্টার কীবোর্ড শর্টকাট (ডেটা রিফ্রেশ)
  // ========================
  function setupGlobalEnterShortcut() {
    document.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        if (document.activeElement && (document.activeElement.tagName === 'BUTTON' || document.activeElement.tagName === 'INPUT')) {
          return;
        }
        event.preventDefault();
        loadData();
        showToast("⌨️ এন্টার চাপা হয়েছে → ডেটা রিফ্রেশ", "info");
      }
    });
  }

  // ========================
  // বাটন ইভেন্ট লিসেনার ও প্রাথমিক লোড
  // ========================
  document.getElementById("createSheetBtn").addEventListener("click", createSheetAction);
  document.getElementById("syncBtn").addEventListener("click", syncAction);
  document.getElementById("sendSmsBtn").addEventListener("click", sendSmsAction);
  document.getElementById("clearDataBtn").addEventListener("click", clearDataAction);
  document.getElementById("refreshBtn").addEventListener("click", loadData);

  // পেজ লোড হলে ডেটা আনুন
  loadData();
  setupGlobalEnterShortcut();

  // অতিরিক্ত: বাটনগুলোর টুলটিপ ইফেক্ট (বাংলায় ইঙ্গিত) 
  console.log("বাংলা এসএমএস ড্যাশবোর্ড প্রস্তুত - গ্লাসমরফিজম, লোডার ও টোস্ট");
