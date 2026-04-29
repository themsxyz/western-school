// ========== GLASS TOAST ==========
    const toastElement = document.getElementById('glassToast');
    const toastMessageSpan = toastElement.querySelector('.toast-message');
    const toastIconSvg = toastElement.querySelector('.toast-icon svg');
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
        toastIconSvg.innerHTML = iconPath;
        toastMessageSpan.textContent = message;
        toastElement.classList.remove('show');
        void toastElement.offsetWidth;
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
    
    // Override alert
    window.alert = function(msg) { showToast(msg, 'info'); };
    
    // ========== LOADER FUNCTIONS ==========
    const loaderOverlay = document.getElementById('globalLoader');
    function showLoader() { if (loaderOverlay) loaderOverlay.style.display = 'flex'; }
    function hideLoader() { if (loaderOverlay) loaderOverlay.style.display = 'none'; }
    
    // ========== API CONFIG ==========
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
    let currentApiUrl = null;
    let currentActiveClassKey = null;
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const FEE_CATEGORIES = ["Monthly Tuition Fee", "Admission Fee", "Exam Fee", "Computer Fee", "Sports Fee", "TCP", "Miscellaneous"];
    const RECEIPT_CATEGORIES = FEE_CATEGORIES;
    let currentStudent = null;
    let lastUpdateData = null;
    let feeItems = [];
    let lockedMonths = [];
    let receiptNumbersPerMonth = [];
    
    async function callApi(action, payload) {
        if (!currentApiUrl) throw new Error("No class selected. Please select and apply a class first.");
        try {
            const res = await fetch(currentApiUrl, { method: "POST", body: JSON.stringify({ action, ...payload }) });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error("API call failed:", err);
            throw new Error(`API Error: ${err.message}. Check class configuration.`);
        }
    }
    
    function resetUIForNewClass() {
        document.getElementById("feeTableCard").style.display = "none";
        document.getElementById("feeFormCard").style.display = "none";
        document.getElementById("studentInfo").classList.add("fee-hidden");
        document.getElementById("feeSearchId").value = "";
        document.getElementById("updateSuccessMessage").classList.add("fee-hidden");
        document.getElementById("receiptInfo").classList.add("fee-hidden");
        currentStudent = null;
        lockedMonths = [];
        receiptNumbersPerMonth = [];
        document.getElementById("feeContainer").innerHTML = "";
        document.getElementById("monthsCheckboxContainer").innerHTML = "";
        feeItems = [];
        if (document.getElementById("feeItemsContainer")) document.getElementById("feeItemsContainer").innerHTML = "";
    }
    
    function applyClassSelection() {
        const selectElem = document.getElementById("classSelect");
        const selectedClassKey = selectElem.value;
        if (!selectedClassKey) { showToast("Please select a class from the dropdown.", "warning"); return; }
        const selectedUrl = CLASS_API_MAP[selectedClassKey];
        if (!selectedUrl) { showToast("Invalid class selected. URL not found.", "error"); return; }
        currentActiveClassKey = selectedClassKey;
        currentApiUrl = selectedUrl;
        const classDisplayName = selectElem.options[selectElem.selectedIndex]?.text || selectedClassKey;
        document.getElementById("activeClassStatus").innerHTML = `<span class="fee-active-class-badge">ACTIVE: ${classDisplayName}</span>`;
        document.getElementById("apiStatusBadge").innerHTML = `✅ Connected: ${selectedClassKey.toUpperCase()}`;
        document.getElementById("apiStatusBadge").style.background = "#dcfce7";
        resetUIForNewClass();
        const panel = document.querySelector(".fee-class-selector-panel");
        const oldMsg = document.getElementById("tempClassMsg");
        if (oldMsg) oldMsg.remove();
        const successMsg = document.createElement("div");
        successMsg.className = "fee-success-message";
        successMsg.style.marginTop = "8px";
        successMsg.style.padding = "6px";
        successMsg.innerText = `✅ Class "${classDisplayName}" activated. You can now search students.`;
        successMsg.id = "tempClassMsg";
        panel.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
        showToast(`Class "${classDisplayName}" activated`, "success");
    }
    
    function calculateLockedMonths(feeData) {
        const locked = [];
        for (let i = 0; i < MONTHS.length; i++) {
            const month = MONTHS[i];
            let hasFee = false;
            for (const cat of FEE_CATEGORIES) {
                if (feeData[cat] && feeData[cat][month] > 0) { hasFee = true; break; }
            }
            if (hasFee) locked.push(month);
        }
        return locked;
    }
    
    function renderMonthCheckboxes() {
        const container = document.getElementById("monthsCheckboxContainer");
        let html = '';
        MONTHS.forEach(month => {
            const isLocked = lockedMonths.includes(month);
            const disabledAttr = isLocked ? 'disabled' : '';
            const disabledClass = isLocked ? 'disabled' : '';
            html += `<label class="fee-month-checkbox ${disabledClass}">
                        <input type="checkbox" class="month-check" value="${month}" ${disabledAttr}> ${month}
                        ${isLocked ? '🔒' : ''}
                    </label>`;
        });
        container.innerHTML = html;
        const warning = document.getElementById("monthWarning");
        if (lockedMonths.length > 0) {
            warning.innerHTML = `⚠️ Months with existing fees cannot be updated: ${lockedMonths.join(', ')}`;
            warning.classList.remove("fee-hidden");
        } else {
            warning.classList.add("fee-hidden");
        }
    }
    
    function renderFeeItems() {
        const container = document.getElementById("feeItemsContainer");
        if (feeItems.length === 0) feeItems.push({ category: FEE_CATEGORIES[0], amount: 0 });
        let html = '';
        feeItems.forEach((item, index) => {
            html += `<div class="fee-item-row" id="feeItem_${index}">
                        <select class="fee-category-select" data-index="${index}" style="width: 45%;">
                            ${FEE_CATEGORIES.map(cat => `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                        </select>
                        <input type="number" class="fee-amount-input" data-index="${index}" placeholder="Amount (Tk)" value="${item.amount}" style="width: 35%;">
                        <button class="fee-btn fee-remove-btn" data-index="${index}">✖ Remove</button>
                    </div>`;
        });
        html += `<div style="font-size: 12px; color: #64748b; margin-top: 15px; margin-bottom: 15px;">💡 Tip: Add multiple fee categories for the selected months</div>`;
        container.innerHTML = html;
        
        document.querySelectorAll('.fee-category-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                feeItems[idx].category = e.target.value;
            });
        });
        document.querySelectorAll('.fee-amount-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                feeItems[idx].amount = parseFloat(e.target.value) || 0;
            });
        });
        document.querySelectorAll('.fee-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                feeItems.splice(idx, 1);
                renderFeeItems();
            });
        });
    }
    
    function displayFeeTable(feeData, monthlyTotals, overallTotal, receiptRow) {
        const container = document.getElementById("feeContainer");
        let html = `<table class="fee-table"><thead><tr style="background:#1e3a5f; color:white;">
                        <th>Category</th>${MONTHS.map(m=>`<th>${m}</th>`).join('')}<th>Total (12m)</th>
                    </tr></thead>`;
        if (receiptRow && receiptRow.length === 12) {
            html += `<tr class="fee-receipt-row" style="background:#fef9e6;">
                        <td style="font-weight:600;">Receipt No.</td>
                        ${receiptRow.map(r => `<td style="font-size:11px;">${r || '-'}</td>`).join('')}
                        <td></td>
                    </tr>`;
        }
        html += `<tbody>`;
        for (const cat of FEE_CATEGORIES) {
            html += `<tr><td style="font-weight:600; background:#f8fafc;">${cat}</td>`;
            let rowTotal = 0;
            for (const m of MONTHS) {
                let val = feeData[cat]?.[m] || 0;
                rowTotal += val;
                const paidClass = val > 0 ? 'fee-paid-cell' : '';
                html += `<td class="${paidClass}">${val || '-'}</td>`;
            }
            html += `<td style="font-weight:bold; background:#eef2ff;">${rowTotal}</td></tr>`;
        }
        html += `<tr style="background:#f1f5f9; font-weight:bold;">
                    <td>TOTAL (Month)</td>`;
        for (let i=0; i<12; i++) html += `<td>${monthlyTotals[i] || 0}</td>`;
        html += `<td style="background:#fef3c7;">${overallTotal} Tk</td></tr>`;
        html += `</tbody></table>`;
        container.innerHTML = html;
    }
    
    // Search with loader
    async function handleSearch() {
        if (!currentApiUrl) { showToast("Please select and apply a class first.", "warning"); return; }
        const id = document.getElementById("feeSearchId").value.trim();
        if (!id) { showToast("Please enter Student ID", "warning"); return; }
        showLoader();
        try {
            const res = await callApi("getFullData", { id });
            if (res.status === "found") {
                currentStudent = res;
                lockedMonths = calculateLockedMonths(res.feeData);
                receiptNumbersPerMonth = res.receiptNumbersPerMonth || [];
                const studentInfo = document.getElementById("studentInfo");
                studentInfo.innerHTML = `<strong>${res.basic["Student Name"]}</strong> | Roll: ${res.basic["Roll"]} | Class: ${res.basic["Class"]}-${res.basic["Section"]} | ID: ${id} | <span style="background:#dbeafe; padding:2px 8px; border-radius:12px;">📘 ${currentActiveClassKey.toUpperCase()}</span>`;
                studentInfo.classList.remove("fee-hidden");
                displayFeeTable(res.feeData, res.monthlyTotals, res.overallTotal, receiptNumbersPerMonth);
                document.getElementById("feeTableCard").style.display = "block";
                document.getElementById("feeFormCard").style.display = "block";
                renderMonthCheckboxes();
                feeItems = [{ category: FEE_CATEGORIES[0], amount: 0 }];
                renderFeeItems();
                lastUpdateData = null;
                document.getElementById("updateSuccessMessage").classList.add("fee-hidden");
                document.getElementById("receiptInfo").classList.add("fee-hidden");
            } else {
                showToast("Student not found in the selected class database.", "error");
                document.getElementById("feeTableCard").style.display = "none";
                document.getElementById("feeFormCard").style.display = "none";
                document.getElementById("studentInfo").classList.add("fee-hidden");
            }
        } catch (err) {
            showToast("Error: " + err.message, "error");
        } finally {
            hideLoader();
        }
    }
    
    document.getElementById("feeSearchBtn").onclick = handleSearch;
    
    // ENTER KEY SHORTCUT for search input
    const searchInput = document.getElementById("feeSearchId");
    searchInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    });
    
    // Update fees with loader
    document.getElementById("updateFeesBtn").onclick = async () => {
        if (!currentApiUrl) { showToast("No active class selected. Please apply a class first.", "warning"); return; }
        const id = document.getElementById("feeSearchId").value.trim();
        const selectedMonths = [];
        document.querySelectorAll('.month-check:checked:not(:disabled)').forEach(cb => selectedMonths.push(cb.value));
        const validFeeItems = feeItems.filter(item => item.amount > 0);
        if (!id || selectedMonths.length === 0) { showToast("Please select at least one unlocked month", "warning"); return; }
        if (validFeeItems.length === 0) { showToast("Please add at least one fee category with amount > 0", "warning"); return; }
        showLoader();
        try {
            const res = await callApi("batchUpdateFees", { id, months: selectedMonths, feeItems: validFeeItems });
            if (res.status === "ok") {
                const receiptNumber = res.receiptNumber;
                const successDiv = document.getElementById("updateSuccessMessage");
                successDiv.innerHTML = `✅ ${res.updatedCount} fee record(s) updated successfully! Receipt No: ${receiptNumber}`;
                successDiv.classList.remove("fee-hidden");
                const refreshedData = await callApi("getFullData", { id });
                if (refreshedData.status === "found") {
                    currentStudent = refreshedData;
                    lockedMonths = calculateLockedMonths(refreshedData.feeData);
                    receiptNumbersPerMonth = refreshedData.receiptNumbersPerMonth || [];
                    displayFeeTable(refreshedData.feeData, refreshedData.monthlyTotals, refreshedData.overallTotal, receiptNumbersPerMonth);
                    renderMonthCheckboxes();
                    lastUpdateData = { studentId: id, months: selectedMonths, feeItems: validFeeItems, receiptNumber, timestamp: new Date() };
                    await generateReceiptFromLastUpdate();
                }
                document.querySelectorAll('.month-check:checked').forEach(cb => cb.checked = false);
                feeItems = [{ category: FEE_CATEGORIES[0], amount: 0 }];
                renderFeeItems();
                showToast("Fees updated successfully", "success");
            } else {
                showToast("Error updating fees: " + (res.message || "Unknown error"), "error");
            }
        } catch (err) {
            showToast("Network error: " + err.message, "error");
        } finally {
            hideLoader();
        }
    };
    
    async function generateReceiptFromLastUpdate() {
        if (!lastUpdateData || !currentStudent) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageWidth = 297, pageHeight = 210, colWidth = pageWidth / 3;
        const receiptNumber = lastUpdateData.receiptNumber;
        const updatedMonths = lastUpdateData.months;
        const updatedFeeItems = lastUpdateData.feeItems;
        const studentId = lastUpdateData.studentId;
        const studentData = currentStudent;
        const feeData = {};
        let grandTotal = 0;
        for (const cat of RECEIPT_CATEGORIES) {
            feeData[cat] = {};
            let catTotal = 0;
            for (const month of updatedMonths) {
                const updatedItem = updatedFeeItems.find(item => item.category === cat);
                if (updatedItem) {
                    feeData[cat][month] = updatedItem.amount;
                    catTotal += updatedItem.amount;
                } else {
                    const existingAmount = studentData.feeData[cat]?.[month] || 0;
                    feeData[cat][month] = existingAmount;
                    catTotal += existingAmount;
                }
            }
            grandTotal += catTotal;
        }
        function formatDate() { const d = new Date(); return `${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}`; }
        function formatTime() { return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
        function numberToWords(num) {
            if (num === 0) return 'Zero';
            const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            function convert(n) {
                if (n === 0) return '';
                if (n < 10) return ones[n];
                if (n < 20) return teens[n - 10];
                if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
                if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
                if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
                return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
            }
            return convert(num) + ' Taka';
        }
        function drawColumn(x, title) {
            let y = 10;
            doc.setFont('times', 'bold'); doc.setFontSize(10);
            doc.text('Western School and College', x + colWidth/2, y, { align: 'center' });
            y += 5; doc.setFontSize(8);
            doc.text('Chattogram, Bangladesh', x + colWidth/2, y, { align: 'center' });
            y += 6; doc.setFont('times', 'bold');
            doc.text(title, x + colWidth/2, y, { align: 'center' });
            y += 5; doc.setFont('times', 'normal');
            doc.text(`Date: ${formatDate()}   Time: ${formatTime()}   Receipt No: ${receiptNumber}`, x + colWidth/2, y, { align: 'center' });
            y += 5; doc.text(`Month(s): ${updatedMonths.join(', ')}`, x + colWidth/2, y, { align: 'center' });
            y += 6;
            const studentRows = [['Name', studentData.basic["Student Name"] || ''], ['Roll', studentData.basic["Roll"] || ''], ['Class', studentData.basic["Class"] || ''], ['Section', studentData.basic["Section"] || ''], ['ID', studentId]];
            studentRows.forEach(row => { doc.text(row[0] + ': ' + row[1], x + 2, y); y += 4; });
            y += 2;
            const feesList = [];
            for (const cat of RECEIPT_CATEGORIES) {
                let catTotal = 0;
                for (const month of updatedMonths) catTotal += feeData[cat]?.[month] || 0;
                feesList.push([cat, catTotal]);
            }
            let tableStartY = y;
            let rowHeight = 5;
            doc.setFontSize(7.5);
            feesList.forEach((f, i) => {
                let rowY = tableStartY + (i * rowHeight);
                doc.rect(x + 2, rowY, colWidth - 4, rowHeight);
                doc.line(x + colWidth - 20, rowY, x + colWidth - 20, rowY + rowHeight);
                doc.text(f[0].substring(0, 22), x + 3, rowY + 3.5);
                doc.text(f[1] > 0 ? f[1].toString() : "0", x + colWidth - 15, rowY + 3.5);
            });
            y = tableStartY + (feesList.length * rowHeight) + 3;
            doc.setFont('times', 'bold'); doc.text(`Total: ${grandTotal} Tk`, x + 2, y);
            y += 4; doc.setFont('times', 'normal'); doc.text(`In Words: ${numberToWords(grandTotal)}`, x + 2, y);
            y += 5; doc.setFont('times', 'bold'); doc.text('Payment: Bank / Bkash', x + 2, y);
            doc.setFont('times', 'normal'); doc.text('Guardian Sign', x + 2, pageHeight - 10);
            doc.text('Accountant Sign', x + colWidth - 35, pageHeight - 10);
            doc.rect(x, 5, colWidth, pageHeight - 10);
        }
        drawColumn(0, 'Guardian Copy');
        drawColumn(colWidth, 'School Copy');
        drawColumn(colWidth * 2, 'Bank Copy');
        doc.save(`receipt_${studentId}_${receiptNumber}.pdf`);
        const receiptInfo = document.getElementById("receiptInfo");
        const feeItemsList = updatedFeeItems.map(item => `${item.category}: ${item.amount} Tk`).join(', ');
        receiptInfo.innerHTML = `📄 Receipt generated!<br>Receipt No: ${receiptNumber} | Months: ${updatedMonths.join(', ')}<br>Fees: ${feeItemsList}<br>Total: ${grandTotal} Tk`;
        receiptInfo.classList.remove("fee-hidden");
        setTimeout(() => receiptInfo.classList.add("fee-hidden"), 10000);
    }
    
    document.getElementById("addFeeItemBtn").onclick = () => {
        feeItems.push({ category: FEE_CATEGORIES[0], amount: 0 });
        renderFeeItems();
    };
    document.getElementById("applyClassBtn").onclick = applyClassSelection;
    
    // Initial state
    resetUIForNewClass();
    document.getElementById("apiStatusBadge").innerHTML = "⚠️ Select class first";
    document.getElementById("apiStatusBadge").style.background = "#fee2e2";
