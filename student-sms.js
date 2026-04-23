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