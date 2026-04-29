
    // ---------- UI Helpers ----------
    const toast = document.getElementById('toast'), toastMsg = document.getElementById('toastMsg');
    function showToast(msg, type = 'info') { toastMsg.innerText = msg; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'), 3500); }
    
    // ---------- Strict Loader with min 0.5s and max 4s ----------
    const loaderOverlay = document.getElementById('loader');
    let loaderStartTime = 0;
    let loaderTimeoutId = null;
    let isLoaderVisible = false;
    
    function showLoader() {
        if (loaderTimeoutId) clearTimeout(loaderTimeoutId);
        loaderStartTime = Date.now();
        loaderOverlay.style.display = 'flex';
        isLoaderVisible = true;
        loaderTimeoutId = setTimeout(() => {
            if (isLoaderVisible) {
                hideLoader();
                showToast('সাবমিট হয়েছে', 'error');
            }
        }, 4000);
    }
    
    function hideLoader() {
        if (!isLoaderVisible) return;
        const elapsed = Date.now() - loaderStartTime;
        const remaining = 500 - elapsed;
        if (remaining > 0) {
            setTimeout(() => {
                if (isLoaderVisible) {
                    loaderOverlay.style.display = 'none';
                    isLoaderVisible = false;
                    if (loaderTimeoutId) clearTimeout(loaderTimeoutId);
                }
            }, remaining);
        } else {
            loaderOverlay.style.display = 'none';
            isLoaderVisible = false;
            if (loaderTimeoutId) clearTimeout(loaderTimeoutId);
        }
    }
    
    function confirmMsg(msg) {
        return new Promise(resolve => {
            let ov = document.createElement('div');
            ov.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:30000;';
            ov.innerHTML = `<div style="background:white;border-radius:60px;padding:1.5rem;max-width:300px;text-align:center;box-shadow:0 20px 35px rgba(0,0,0,0.2);"><p>${msg}</p><div style="margin-top:1.2rem;"><button id="yesBtn" style="background:#2c5a3b;border-radius:40px;padding:0.5rem 1.2rem;color:white;margin-right:0.8rem;">হ্যাঁ</button><button id="noBtn" style="background:#a1622b;border-radius:40px;padding:0.5rem 1.2rem;color:white;">না</button></div></div>`;
            document.body.appendChild(ov);
            ov.querySelector('#yesBtn').onclick = () => { ov.remove(); resolve(true); };
            ov.querySelector('#noBtn').onclick = () => { ov.remove(); resolve(false); };
        });
    }
    
    function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
    function formatPhoneNumber(input) {
        let val = input.value.replace(/\D/g, '');
        if (val.length === 0) { input.value = ''; return; }
        if (val[0] === '1') val = '0' + val;
        if (val.startsWith('00')) val = '0' + val.substring(2);
        if (val.length > 11) val = val.slice(0,11);
        input.value = val;
    }

    // Auto capitalize for father/mother names (already CSS, but also ensure data before send)
    function capitalizeWords(str) {
        if (!str) return '';
        return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }
    
    // Uppercase transform for name fields (text-transform already, but we also store exact)
    function processFormData() {
        let nameField = document.getElementById('newName');
        let sectionField = document.getElementById('newSection');
        let bloodField = document.getElementById('newBlood');
        if(nameField) nameField.value = nameField.value.toUpperCase();
        if(sectionField) sectionField.value = sectionField.value.toUpperCase();
        if(bloodField) bloodField.value = bloodField.value.toUpperCase();
        let fname = document.getElementById('newFname');
        let mname = document.getElementById('newMname');
        if(fname) fname.value = capitalizeWords(fname.value);
        if(mname) mname.value = capitalizeWords(mname.value);
        let address = document.getElementById('newAddress');
        if(address) address.value = capitalizeWords(address.value);
    }

    // ---------- API Config ----------
    let currentApiUrl = null, currentClassKey = null, currentStudent = null;
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
    const classToBangla = { nursery:"নার্সারি", play:"প্লে", kg:"কেজি", class1:"প্রথম শ্রেণি", class2:"দ্বিতীয় শ্রেণি", class3:"তৃতীয় শ্রেণি", class4:"চতুর্থ শ্রেণি", class5:"পঞ্চম শ্রেণি" };

    async function callApi(action, payload) {
        if (!currentApiUrl) throw new Error('API নাই');
        const res = await fetch(currentApiUrl, { method: 'POST', body: JSON.stringify({ action, ...payload }) });
        return await res.json();
    }

    // ---------- Database Seat ----------
    async function checkDatabase() {
        const selected = document.getElementById('classForDb').value;
        if (!selected) return;
        currentApiUrl = CLASS_API_MAP[selected];
        if (!currentApiUrl) { document.getElementById('dbStatus').innerHTML = '❌ ভুল URL'; return; }
        showLoader();
        try {
            let res = await callApi('checkMainSheet', {});
            if (res.exists) {
                document.getElementById('dbStatus').innerHTML = '✅ ডেটাবেস সিলেক্টেড';
                document.getElementById('mainApp').classList.remove('hidden');
                activateClass(selected);
            } else {
                document.getElementById('dbStatus').innerHTML = '⚠️ ডেটাবেস নেই';
                document.getElementById('mainApp').classList.add('hidden');
            }
        } catch(e) { document.getElementById('dbStatus').innerHTML = '⚠️ সংযোগ সমস্যা'; }
        finally { hideLoader(); }
    }

    async function createDatabase() {
        const selected = document.getElementById('classForDb').value;
        if (!selected) { showToast('ক্লাস নির্বাচন করুন'); return; }
        currentApiUrl = CLASS_API_MAP[selected];
        if (!currentApiUrl) { showToast('URL পাওয়া যায়নি'); return; }
        showLoader();
        try {
            let res = await callApi('createMainSheet', {});
            if (res.status === 'ok') { showToast('ডেটাবেস তৈরি!','success'); await checkDatabase(); }
            else showToast('তৈরি ব্যর্থ','error');
        } catch(e) { showToast('সমস্যা হয়েছে'); } finally { hideLoader(); }
    }

    // ---------- Core UI ----------
    function resetUI() {
        document.getElementById('profileView').classList.add('hidden');
        document.getElementById('profileView').innerHTML = '';
        document.getElementById('searchId').value = '';
        document.getElementById('updateBtn').classList.add('hidden');
        document.getElementById('deleteBtn').classList.add('hidden');
        currentStudent = null;
        document.getElementById('formTitle').innerHTML = '➕ নতুন শিক্ষার্থী তৈরি';
        // clear all input fields except ID prefill with 100
        ['newName','newRoll','newClass','newSection','newPhotoUrl','newDob','newBcn','newFname','newMname','newFnid','newMnid','newAddress','newPhone','newBlood'].forEach(id => { let el=document.getElementById(id); if(el) el.value=''; });
        document.getElementById('newPhotoFile').value = '';
        // Set default ID "100" as per requirement
        document.getElementById('newId').value = '100';
        // auto fill class if active
        if(currentClassKey) document.getElementById('newClass').value = classToBangla[currentClassKey];
    }

    function updateClassStatus() {
        const area = document.getElementById('classStatus');
        if(currentClassKey) area.innerHTML = `<span style="background:rgba(44,62,78,0.15); padding:5px 20px; border-radius:40px;">✅ সক্রিয়: ${classToBangla[currentClassKey]}</span>`;
        else area.innerHTML = '';
    }
    function autoFillClass() { if(currentClassKey) document.getElementById('newClass').value = classToBangla[currentClassKey]; }

    function activateClass(classKey) {
        currentClassKey = classKey;
        localStorage.setItem('activeClass', classKey);
        updateClassStatus();
        resetUI();  // this will also set ID to 100 and fill class
        autoFillClass();
        showToast(`${classToBangla[classKey]} ক্লাস সক্রিয়`);
    }

    async function handleSearch() {
        let id = document.getElementById('searchId').value.trim();
        if(!id) { showToast('আইডি দিন'); return; }
        showLoader();
        try {
            let res = await callApi('getFullData', { id });
            if(res.status === 'found') {
                currentStudent = res;
                const b = res.basic;
                let profileHtml = `<div class="profile-card"><img src="https://res.cloudinary.com/do1dejkkk/image/upload/v1777138381/profile-svgrepo-com_jalrok.svg" class="profile-img"><h3>${escapeHtml(b["Student Name"] || '')}</h3></div><div class="info-grid">`;
                for(let [k,v] of Object.entries(b)) {
                    if(k !== 'Photo URL' && k !== 'Student Name')
                        profileHtml += `<div class="info-item"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v) || '—'}</div>`;
                }
                profileHtml += `</div>`;
                document.getElementById('profileView').innerHTML = profileHtml;
                document.getElementById('profileView').classList.remove('hidden');
                document.getElementById('updateBtn').classList.remove('hidden');
                document.getElementById('deleteBtn').classList.remove('hidden');
                document.getElementById('formTitle').innerHTML = '✏️ শিক্ষার্থী সম্পাদনা';
                document.getElementById('newId').value = id;
                document.getElementById('newName').value = b["Student Name"] || '';
                document.getElementById('newRoll').value = b["Roll"] || '';
                document.getElementById('newClass').value = b["Class"] || '';
                document.getElementById('newSection').value = b["Section"] || '';
                document.getElementById('newPhotoUrl').value = b["Photo URL"] || '';
                document.getElementById('newDob').value = b["Date of birth"] || '';
                document.getElementById('newBcn').value = b["Birth registration number"] || '';
                document.getElementById('newFname').value = b["Father's name"] || '';
                document.getElementById('newMname').value = b["Mother's name"] || '';
                document.getElementById('newFnid').value = b["Father's NID"] || '';
                document.getElementById('newMnid').value = b["Mother's NID"] || '';
                document.getElementById('newAddress').value = b["Address"] || '';
                document.getElementById('newPhone').value = b["Phone number"] || '';
                document.getElementById('newBlood').value = b["Blood group"] || '';
                // apply capitalization styles consistency
                document.getElementById('newName').value = document.getElementById('newName').value.toUpperCase();
                if(document.getElementById('newFname').value) document.getElementById('newFname').value = capitalizeWords(document.getElementById('newFname').value);
                if(document.getElementById('newMname').value) document.getElementById('newMname').value = capitalizeWords(document.getElementById('newMname').value);
            } else { showToast('শিক্ষার্থী পাওয়া যায়নি'); resetUI(); }
        } catch(e) { console.warn(e); } finally { hideLoader(); }
    }

    async function refreshAllRecords() {
        if (!currentApiUrl) return;
        showLoader();
        try {
            let res = await callApi('getAllStudents', {});
            if (res.status === 'ok' && res.students) {
                let html = '<table><thead><tr><th>নাম</th><th>আইডি</th><th>শ্রেণি</th><th>রোল</th><th>মোবাইল</th><th>পিতা</th></tr></thead><tbody>';
                res.students.forEach(s => {
                    html += `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.id)}</td><td>${escapeHtml(s.class)}</td><td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.phone)}</td><td>${escapeHtml(s.father)}</td></tr>`;
                });
                html += '</tbody></table>';
                document.getElementById('recordsTable').innerHTML = html;
                document.getElementById('allRecordsSection').classList.remove('hidden');
            } else { showToast('তালিকা লোড ব্যর্থ','error'); }
        } catch(e) { showToast('রিফ্রেশ ব্যর্থ','error'); } finally { hideLoader(); }
    }

    async function createStudent() {
        let id = document.getElementById('newId').value.trim();
        if(!id) { showToast('আইডি প্রয়োজন'); return; }
        processFormData();  // ensure uppercase & capitalized before send
        showLoader();
        try {
            let photoBase64 = null;
            let file = document.getElementById('newPhotoFile').files[0];
            if(file) photoBase64 = await new Promise(r => { let fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
            let payload = {
                id, name: document.getElementById('newName').value, roll: document.getElementById('newRoll').value,
                class: document.getElementById('newClass').value, section: document.getElementById('newSection').value,
                photoUrl: document.getElementById('newPhotoUrl').value, photoBase64, dob: document.getElementById('newDob').value,
                bcn: document.getElementById('newBcn').value, fname: document.getElementById('newFname').value,
                mname: document.getElementById('newMname').value, fnid: document.getElementById('newFnid').value,
                mnid: document.getElementById('newMnid').value, address: document.getElementById('newAddress').value,
                phone: document.getElementById('newPhone').value, blood: document.getElementById('newBlood').value
            };
            let res = await callApi('create', payload);
            if(res.status === 'created') { showToast('সফল!','success'); resetUI(); refreshAllRecords(); }
            else showToast(res.message || 'ত্রুটি','error');
        } catch(e) { showToast('তৈরি ব্যর্থ'); } finally { hideLoader(); }
    }

    async function updateStudent() {
        if(!currentStudent) return;
        let id = document.getElementById('newId').value.trim();
        if(!id) return;
        processFormData();
        showLoader();
        try {
            let photoBase64 = null;
            let file = document.getElementById('newPhotoFile').files[0];
            if(file) photoBase64 = await new Promise(r => { let fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
            let payload = {
                id, name: document.getElementById('newName').value, roll: document.getElementById('newRoll').value,
                class: document.getElementById('newClass').value, section: document.getElementById('newSection').value,
                photoUrl: document.getElementById('newPhotoUrl').value, photoBase64, dob: document.getElementById('newDob').value,
                bcn: document.getElementById('newBcn').value, fname: document.getElementById('newFname').value,
                mname: document.getElementById('newMname').value, fnid: document.getElementById('newFnid').value,
                mnid: document.getElementById('newMnid').value, address: document.getElementById('newAddress').value,
                phone: document.getElementById('newPhone').value, blood: document.getElementById('newBlood').value
            };
            let res = await callApi('updateBasic', payload);
            if(res.status === 'updated') { showToast('হালনাগাদ সফল','success'); await handleSearch(); refreshAllRecords(); }
            else showToast('আপডেট ব্যর্থ','error');
        } catch(e) { } finally { hideLoader(); }
    }

    async function deleteStudent() {
        let id = document.getElementById('searchId').value.trim();
        if(!id) return;
        if(await confirmMsg('স্থায়ীভাবে মুছবেন?')) {
            showLoader();
            try {
                let res = await callApi('delete', { id });
                if(res.status === 'deleted') { showToast('মুছে ফেলা হয়েছে','success'); resetUI(); refreshAllRecords(); }
                else showToast('ত্রুটি','error');
            } catch(e) { } finally { hideLoader(); }
        }
    }

    // Event bindings + ENTER key for forms
    document.getElementById('createDbBtn').onclick = createDatabase;
    document.getElementById('classForDb').onchange = checkDatabase;
    document.getElementById('refreshBtn').onclick = () => { if(currentApiUrl) refreshAllRecords(); };
    document.getElementById('showAllBtn').onclick = refreshAllRecords;
    document.getElementById('closeRecordsBtn').onclick = () => document.getElementById('allRecordsSection').classList.add('hidden');
    document.getElementById('searchBtn').onclick = handleSearch;
    
    // ENTER key for search field
    const searchInput = document.getElementById('searchId');
    searchInput.addEventListener('keypress', e => { if(e.key === 'Enter') { e.preventDefault(); handleSearch(); } });
    
    // ENTER key submission for create/update form: pressing Enter on any field inside form triggers the respective action
    const formContainer = document.querySelector('.Student .form-grid');
    const activeButtons = () => {
        if(document.getElementById('updateBtn') && !document.getElementById('updateBtn').classList.contains('hidden')) return 'update';
        return 'create';
    };
    const allInputsInForm = document.querySelectorAll('#newId, #newName, #newRoll, #newClass, #newSection, #newDob, #newBcn, #newFname, #newMname, #newFnid, #newMnid, #newAddress, #newPhone, #newBlood');
    allInputsInForm.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if(e.key === 'Enter') {
                e.preventDefault();
                if(activeButtons() === 'update') updateStudent();
                else createStudent();
            }
        });
    });
    
    document.getElementById('createBtn').onclick = createStudent;
    document.getElementById('updateBtn').onclick = updateStudent;
    document.getElementById('deleteBtn').onclick = deleteStudent;
    document.getElementById('applyClassBtn').onclick = () => { let val = document.getElementById('classSelect').value; if(val) activateClass(val); };
    document.getElementById('clearUiBtn').onclick = async() => { if(await confirmMsg('UI সাফ করবেন?')) resetUI(); };
    document.getElementById('newPhone').addEventListener('input', function() { formatPhoneNumber(this); });
    document.getElementById('newRoll').addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g, ''); });
    
    // set initial default ID as "100"
    document.getElementById('newId').value = '100';

    // Initialize
    checkDatabase();
    let savedClass = localStorage.getItem('activeClass');
    if(savedClass) document.getElementById('classSelect').value = savedClass;
