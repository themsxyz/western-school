const API = "https://script.google.com/macros/s/AKfycbzQ1yJU0xqdQJxAg_Jj8yRSo7Z7vydfxK92ExvoKebbPYKTkbyQbjz1e20E50clXXFJtA/exec";

function run(action){
  fetch(API + "?action=" + action)
    .then(r => r.text())
    .then(t => document.getElementById("out").innerText = t)
    .catch(err => {
      document.getElementById("out").innerText = "⚠️ Request failed: " + err.message;
    });
}

function uploadFile() {
  var file = document.getElementById("fileInput").files[0];

  if (!file) {
    alert("Select a file first");
    return;
  }

  var reader = new FileReader();

  reader.onload = function(e) {
    var content = e.target.result;

    fetch("https://script.google.com/macros/s/AKfycbze4JtuYjfoFjaRV_XbaUfauB6BsmiDc0SpQK-bBzwgoexcqM9v3PRBg1xCRztWR2yMjQ/exec", {
      method: "POST",
      body: content
    })
    .then(res => res.text())
    .then(data => {
      document.getElementById("status").innerText = data;
    })
    .catch(err => {
      document.getElementById("status").innerText = "Error: " + (err.message || "Upload failed");
    });
  };

  reader.onerror = function() {
    document.getElementById("status").innerText = "Error reading file";
  };

  reader.readAsText(file);
}

const fileInputElem = document.getElementById("fileInput");
const fileNameSpan = document.getElementById("fileNameDisplay");

if (fileInputElem) {
  fileInputElem.addEventListener("change", function(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      fileNameSpan.innerText = selectedFile.name.length > 35 ? selectedFile.name.slice(0, 32) + "..." : selectedFile.name;
      document.getElementById("status").innerText = "📄 Ready to upload '" + selectedFile.name + "'";
    } else {
      fileNameSpan.innerText = "No file selected";
      document.getElementById("status").innerText = "⏳ Waiting for file upload...";
    }
  });
}

window.run = run;
window.uploadFile = uploadFile;

if (document.getElementById("out").innerText === "") {
  document.getElementById("out").innerText = "💡 Ready — click any action or upload a .txt file";
}



const url = "https://script.google.com/macros/s/AKfycbxz7Y2IX0d7Gc6wOO7X1UEa_kDlb1AnbRQhtbnoIA5rPANL3yqZOqBq1xhEOZr6257qYg/exec";

function showLoader(v){
  const loaderEl = document.getElementById("loader");
  if(loaderEl) loaderEl.style.display = v ? "flex" : "none";
}

function bn(n){
  return new Intl.NumberFormat('bn-BD').format(n || 0);
}

function load(){
  showLoader(true);

  fetch(url+"?mode=admin")
  .then(r=>r.json())
  .then(d=>{
    document.getElementById("sms").innerText = bn(Math.round(d.total_sms_used || 0));
    document.getElementById("cost").innerText = "৳ " + bn(d.sms_cost || 0);
    document.getElementById("rtk").innerText = "৳ " + bn(d.total_recharge_tk || 0);
    document.getElementById("remtk").innerText = "৳ " + bn(d.remaining_tk || 0);
    // REMAINING SMS: show rounded figure (no decimals)
    document.getElementById("remsms").innerText = bn(Math.round(d.remaining_sms || 0));
  })
  .catch(err=>console.warn(err))
  .finally(()=>showLoader(false));
}

function recharge(){
  let amountInput = document.getElementById("amount");
  let amt = amountInput.value;
  if(!amt || parseFloat(amt) <= 0) {
    return;
  }

  showLoader(true);

  fetch(url+"?mode=admin&amount="+encodeURIComponent(amt))
  .then(()=>{
    amountInput.value = "";
    return load();
  })
  .catch(err=>console.warn(err))
  .finally(()=>showLoader(false));
}

function reset(){
  showLoader(true);
  fetch(url+"?mode=admin&reset=true")
  .then(()=>load())
  .catch(err=>console.warn(err))
  .finally(()=>showLoader(false));
}

// ENTER KEY SHORTCUT for recharge button trigger
function setupEnterKey(){
  const amountField = document.getElementById("amount");
  if(amountField){
    amountField.addEventListener("keypress", function(e){
      if(e.key === "Enter"){
        e.preventDefault();
        recharge();
      }
    });
  }
  const rechargeBtn = document.getElementById("rechargeBtn");
  if(rechargeBtn){
    rechargeBtn.onclick = (e) => {
      e.preventDefault();
      recharge();
    };
  }
}

// initialize everything after DOM ready
document.addEventListener("DOMContentLoaded", function(){
  setupEnterKey();
  load();
});

if(document.readyState === "loading"){
  // already added event listener
} else {
  setupEnterKey();
  load();
}