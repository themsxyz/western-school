
const CsvScriptURL = "https://script.google.com/macros/s/AKfycbyxmNHGXBFroIiZhRPRJyNER9R50uph5S6LWzCDkuIQ0YvOk7z77E6O5rQzrP0icX7rGw/exec";

function CsvLog(msg) {
  document.getElementById("CsvOutput").textContent = msg;
}

function CsvUpload() {
  var file = document.getElementById("CsvFile").files[0];
  if (!file) return CsvLog("Select a file first");

  var reader = new FileReader();
  reader.onload = function(e) {
    fetch(CsvScriptURL, {
      method: "POST",
      body: e.target.result
    })
    .then(res => res.text())
    .then(data => CsvLog("Upload Done: " + data))
    .catch(err => CsvLog("Error: " + err));
  };

  reader.readAsText(file);
}

function CsvSync() {
  fetch(CsvScriptURL)
    .then(res => res.json())
    .then(data => CsvLog("Sync: " + JSON.stringify(data, null, 2)))
    .catch(err => CsvLog("Error: " + err));
}

function CsvRefresh() {
  CsvLog("Refreshing...");
  CsvSync();
}

function CsvClear() {
  let url = CsvScriptURL + "?mode=admin&reset=true";

  fetch(url)
    .then(res => res.json())
    .then(data => CsvLog("Cleared: " + JSON.stringify(data)))
    .catch(err => CsvLog("Error: " + err));
}

