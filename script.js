let csvData = "";
let duplicatePayments = [];

document.getElementById("fileInput").addEventListener("change", function () {
  const file = this.files[0];

  if (!file) {
    alert("Please select a CSV file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    csvData = e.target.result;
  };
  reader.readAsText(file);
});

document.getElementById("processBtn").addEventListener("click", function () {
  if (!csvData) {
    alert("Please upload a CSV file first.");
    return;
  }

  duplicatePayments = processCSV(csvData);
  localStorage.setItem("duplicatePayments", JSON.stringify(duplicatePayments));
});

document.getElementById("selectAllBtn").addEventListener("click", function () {
  if (!csvData) {
    alert("Please upload a CSV file first.");
    return;
  }

  localStorage.setItem("fullCSV", csvData);
  window.open("view_all.html", "_blank");
});

document
  .getElementById("duplicatePaymentsBtn")
  .addEventListener("click", function () {
    if (duplicatePayments.length === 0) {
      alert("No duplicate payments found. Please process the CSV first.");
      return;
    }

    window.open("view_duplicates.html", "_blank");
  });

function processCSV(csv) {
  let rows = csv.split("\n").map((row) => row.split(","));
  let data = rows.slice(1);

  let filteredData = data.filter(
    (row) => row[18]?.trim() !== "fake_bank" && row[6]?.trim() === "CARD"
  );

  let duplicates = findAllDuplicates(filteredData);
  displayData(duplicates);
  return duplicates;
}

function findAllDuplicates(data) {
  let seen = new Map();
  let duplicates = [];

  data.forEach((row) => {
    let key = row[16] + row[13] + row[8];
    let currentDate = row[14];

    if (seen.has(key)) {
      let prevRows = seen.get(key);

      prevRows.forEach((prevRow) => {
        let prevTime = new Date(prevRow[14]).getTime();
        let currTime = new Date(currentDate).getTime();
        let timeDiff = Math.abs(currTime - prevTime) / 60000;

        if (timeDiff < 10) {
          duplicates.push([...prevRow]);
          duplicates.push([...row]);
        }
      });

      prevRows.push(row);
    } else {
      seen.set(key, [row]);
    }
  });

  return duplicates;
}

function displayData(duplicates) {
  let tableBody = document.querySelector("#outputTable tbody");
  tableBody.innerHTML = "";

  duplicates.forEach((row) => {
    let tr = document.createElement("tr");

    let columnsToShow = [24, 23, 18, 6, 1, 4, 16, 8, 13, 14];

    columnsToShow.forEach((index) => {
      let td = document.createElement("td");
      td.textContent = row[index] || "N/A";
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });

  if (duplicates.length === 0) {
    alert("No duplicate payments found.");
  }
}
