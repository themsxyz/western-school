// ---------- Toast & Loader ----------
  const toastEl = document.getElementById('glassToast');
  const toastMsg = toastEl.querySelector('.toast-message');
  const toastIcon = toastEl.querySelector('.toast-icon svg');
  let toastTimer = null;
  function showToast(msg, type='info') {
    if(toastTimer) clearTimeout(toastTimer);
    const iconPath = type==='success' ? '<circle cx="12" cy="12" r="10"/><polyline points="18 8 12 16 8 12"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
    toastIcon.innerHTML = iconPath;
    toastMsg.textContent = msg;
    toastEl.classList.remove('show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4000);
  }
  toastEl.querySelector('.toast-close').onclick = () => { toastEl.classList.remove('show'); if(toastTimer) clearTimeout(toastTimer); };
  window.alert = showToast;

  function showConfirm(msg) {
    return new Promise(resolve => {
      const div = document.createElement('div');
      div.className = 'account-confirm-overlay';
      div.innerHTML = `<div class="account-confirm-card"><p>❓ ${msg}</p><div style="display:flex; gap:16px; justify-content:center;"><button id="confirmYesBtn" style="background:#2f6b47; border-radius:999px; padding:6px 16px;">Yes</button><button id="confirmNoBtn" style="background:#9b7b5c; border-radius:999px; padding:6px 16px;">No</button></div></div>`;
      document.body.appendChild(div);
      div.querySelector('#confirmYesBtn').onclick = () => { div.remove(); resolve(true); };
      div.querySelector('#confirmNoBtn').onclick = () => { div.remove(); resolve(false); };
    });
  }
  window.confirm = showConfirm;

  const loader = document.getElementById('globalLoader');
  function showLoader() { loader.style.display = 'flex'; }
  function hideLoader() { loader.style.display = 'none'; }

  // ---------- API endpoints (same class mapping) ----------
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
  const CLASS_DISPLAY = { nursery:"Nursery", play:"Play", kg:"KG", class1:"Class 1", class2:"Class 2", class3:"Class 3", class4:"Class 4", class5:"Class 5" };

  let currentApiUrl = null, currentActiveClassKey = null, currentStudent = null;

  function resetUI() {
    document.getElementById('profileView').classList.add('account-hidden');
    document.getElementById('profileView').innerHTML = '';
    document.getElementById('searchId').value = '';
    document.getElementById('updateBtn').classList.add('account-hidden');
    document.getElementById('deleteStudentBtn').classList.add('account-hidden');
    currentStudent = null;
    document.getElementById('formTitle').innerHTML = '➕ Create New Student';
    ['newId','newName','newRoll','newClass','newSection','newPhotoUrl','newDob','newBcn','newFname','newMname','newFnid','newMnid','newAddress','newPhone','newBlood'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    document.getElementById('newPhotoFile').value = '';
  }

  function updateClassStatus() {
    const area = document.getElementById('classStatusArea');
    area.innerHTML = currentApiUrl && currentActiveClassKey ? `<div style="background:#eef2ff; color:#1e3a5f;">✅ Active: ${CLASS_DISPLAY[currentActiveClassKey]}</div>` : `<div style="background:#f1f5f9; color:#475569;">⚠️ No active class. Select & Activate.</div>`;
  }

  async function callApi(action, payload) {
    if(!currentApiUrl) throw new Error('No active class');
    const res = await fetch(currentApiUrl, { method: 'POST', body: JSON.stringify({ action, ...payload }) });
    return res.json();
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => { const r = new FileReader(); r.readAsDataURL(file); r.onload = () => resolve(r.result); r.onerror = reject; });
  }

  const PROFILE_PLACEHOLDER = "https://res.cloudinary.com/do1dejkkk/image/upload/v1777138381/profile-svgrepo-com_jalrok.svg";
  function displayProfile(basic) {
    const container = document.getElementById('profileView');
    container.classList.remove('account-hidden');
    const photo = `<img src="${PROFILE_PLACEHOLDER}" class="account-profile-img">`;
    let html = `<div style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;"><h3>${basic['Student Name'] || ''}</h3></div><div class="account-info-grid">`;
    for(let [k,v] of Object.entries(basic)) if(k!=='Photo URL' && k!=='Student Name') html += `<div><strong>${k}:</strong> ${v || '—'}</div>`;
    html += `</div>`;
    container.innerHTML = photo + html;
  }

  async function handleSearch() {
    if(!currentApiUrl) { showToast('Activate a class first', 'error'); return; }
    const id = document.getElementById('searchId').value.trim();
    if(!id) { showToast('Enter Student ID', 'warning'); return; }
    showLoader();
    try {
      const res = await callApi('getFullData', { id });
      if(res.status === 'found') {
        currentStudent = res;
        displayProfile(res.basic);
        document.getElementById('updateBtn').classList.remove('account-hidden');
        document.getElementById('deleteStudentBtn').classList.remove('account-hidden');
        document.getElementById('formTitle').innerHTML = '✏️ Edit Student';
        const b = res.basic;
        document.getElementById('newId').value = id;
        document.getElementById('newName').value = b['Student Name'] || '';
        document.getElementById('newRoll').value = b['Roll'] || '';
        document.getElementById('newClass').value = b['Class'] || '';
        document.getElementById('newSection').value = b['Section'] || '';
        document.getElementById('newPhotoUrl').value = b['Photo URL'] || '';
        document.getElementById('newDob').value = b['Date of birth'] || '';
        document.getElementById('newBcn').value = b['Birth registration number'] || '';
        document.getElementById('newFname').value = b["Father's name"] || '';
        document.getElementById('newMname').value = b["Mother's name"] || '';
        document.getElementById('newFnid').value = b["Father's NID"] || '';
        document.getElementById('newMnid').value = b["Mother's NID"] || '';
        document.getElementById('newAddress').value = b['Address'] || '';
        document.getElementById('newPhone').value = b['Phone number'] || '';
        document.getElementById('newBlood').value = b['Blood group'] || '';
      } else { showToast('Student not found', 'error'); resetUI(); }
    } catch(e) { console.warn(e); }
    finally { hideLoader(); }
  }

  document.getElementById('searchBtn').onclick = handleSearch;
  document.getElementById('searchId').addEventListener('keypress', e => { if(e.key === 'Enter') handleSearch(); });

  async function withLoader(fn) { showLoader(); try { await fn(); } finally { hideLoader(); } }

  document.getElementById('createBtn').onclick = async () => {
    if(!currentApiUrl) { showToast('Activate class first', 'error'); return; }
    const id = document.getElementById('newId').value.trim();
    if(!id) { showToast('ID required', 'warning'); return; }
    await withLoader(async () => {
      let photoBase64 = null;
      const file = document.getElementById('newPhotoFile').files[0];
      if(file) photoBase64 = await fileToBase64(file);
      const payload = {
        id, name: document.getElementById('newName').value, roll: document.getElementById('newRoll').value,
        class: document.getElementById('newClass').value, section: document.getElementById('newSection').value,
        photoUrl: document.getElementById('newPhotoUrl').value, photoBase64, dob: document.getElementById('newDob').value,
        bcn: document.getElementById('newBcn').value, fname: document.getElementById('newFname').value,
        mname: document.getElementById('newMname').value, fnid: document.getElementById('newFnid').value,
        mnid: document.getElementById('newMnid').value, address: document.getElementById('newAddress').value,
        phone: document.getElementById('newPhone').value, blood: document.getElementById('newBlood').value
      };
      const res = await callApi('create', payload);
      if(res.status === 'created') { showToast('Student created', 'success'); resetUI(); }
      else showToast(res.message || 'Creation error', 'error');
    });
  };

  document.getElementById('updateBtn').onclick = async () => {
    if(!currentApiUrl || !currentStudent) { showToast('Load student first', 'error'); return; }
    const id = document.getElementById('newId').value.trim();
    if(!id) return;
    await withLoader(async () => {
      let photoBase64 = null;
      const file = document.getElementById('newPhotoFile').files[0];
      if(file) photoBase64 = await fileToBase64(file);
      const payload = {
        id, name: document.getElementById('newName').value, roll: document.getElementById('newRoll').value,
        class: document.getElementById('newClass').value, section: document.getElementById('newSection').value,
        photoUrl: document.getElementById('newPhotoUrl').value, photoBase64, dob: document.getElementById('newDob').value,
        bcn: document.getElementById('newBcn').value, fname: document.getElementById('newFname').value,
        mname: document.getElementById('newMname').value, fnid: document.getElementById('newFnid').value,
        mnid: document.getElementById('newMnid').value, address: document.getElementById('newAddress').value,
        phone: document.getElementById('newPhone').value, blood: document.getElementById('newBlood').value
      };
      const res = await callApi('updateBasic', payload);
      if(res.status === 'updated') { showToast('Updated', 'success'); await handleSearch(); }
      else showToast('Update failed', 'error');
    });
  };

  document.getElementById('deleteStudentBtn').onclick = async () => {
    if(!currentApiUrl) return;
    const id = document.getElementById('searchId').value.trim();
    if(!id) return;
    if(await showConfirm('Permanently delete this student?')) {
      await withLoader(async () => {
        const res = await callApi('delete', { id });
        if(res.status === 'deleted') { showToast('Deleted', 'success'); resetUI(); }
        else showToast('Error', 'error');
      });
    }
  };

  function activateClass(key) {
    if(!CLASS_API_MAP[key]) return false;
    currentApiUrl = CLASS_API_MAP[key];
    currentActiveClassKey = key;
    localStorage.setItem('selectedClassKey', key);
    updateClassStatus();
    resetUI();
    showToast(`${CLASS_DISPLAY[key]} activated`, 'success');
    return true;
  }

  document.getElementById('applyClassBtn').onclick = () => {
    const val = document.getElementById('classSelect').value;
    if(val) activateClass(val);
    else showToast('Select a class', 'warning');
  };
  document.getElementById('clearUiBtn').onclick = async () => { if(await showConfirm('Clear all UI data?')) resetUI(); };

  // Phone sanitizer
  document.getElementById('newPhone').addEventListener('input', function() { this.value = this.value.replace(/\D/g,'').slice(0,11); });
  // Restore saved class
  const saved = localStorage.getItem('selectedClassKey');
  if(saved && CLASS_API_MAP[saved]) { document.getElementById('classSelect').value = saved; activateClass(saved); }
  else updateClassStatus();
