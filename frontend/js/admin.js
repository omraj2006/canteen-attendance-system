const API_BASE = BASE_URL;

// Elements
const openScannerBtn = document.getElementById("openScannerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const refreshAttendanceBtn = document.getElementById("refreshAttendanceBtn");
const downloadReportBtn = document.getElementById("downloadReportBtn");
const attendanceMeta = document.getElementById("attendanceMeta");
const attendanceList = document.getElementById("attendanceList");
const feedbackList = document.getElementById("feedbackList");

const timetableInput = document.getElementById("timetableInput");
const timetablePreview = document.getElementById("timetablePreview");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const uploadTimetableBtn = document.getElementById("uploadTimetableBtn");
const uploadStatus = document.getElementById("uploadStatus");

// --- Auth ---
if (localStorage.getItem("role") !== "admin") {
  window.location.href = "login.html";
}

logoutBtn.addEventListener("click", () => {
  clearAuthState();
  window.location.href = "login.html";
});

if (openScannerBtn) {
  openScannerBtn.addEventListener("click", () => {
    window.location.href = "scanner.html";
  });
}

if (openCouponsBtn) {
  openCouponsBtn.addEventListener("click", () => {
    window.location.href = "admin-coupons.html";
  });
}

if (openAnalyticsBtn) {
  openAnalyticsBtn.addEventListener("click", () => {
    window.location.href = "admin-analytics.html";
  });
}

// --- Attendance ---
async function fetchAttendance() {
  attendanceMeta.textContent = "Loading...";
  try {
    const response = await fetch(`${API_BASE}/attendance/today`, {
        headers: {
            'ngrok-skip-browser-warning': '69420'
        }
    });
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.message);

    attendanceMeta.textContent = `Date: ${data.date} | Total: ${data.count}`;
    renderAttendance(data.records);
  } catch (error) {
    attendanceMeta.textContent = "Failed to load attendance";
    console.error(error);
  }
}

function renderAttendance(records) {
  if (!records || records.length === 0) {
    attendanceList.innerHTML = '<div class="meta">No records for today</div>';
    return;
  }

  const html = `
    <div class="table">
      <div class="row header-row">
        <div>Name</div>
        <div>Room</div>
        <div>Meal</div>
        <div>Time</div>
      </div>
      ${records.map(r => `
        <div class="row">
          <div>${r.name}</div>
          <div>${r.room_no}</div>
          <div>${r.mealType}</div>
          <div>${r.time}</div>
        </div>
      `).join('')}
    </div>
  `;
  attendanceList.innerHTML = html;
}

refreshAttendanceBtn.addEventListener("click", fetchAttendance);

const downloadMenu = document.getElementById("downloadMenu");
const downloadExcelBtn = document.getElementById("downloadExcelBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

// Toggle dropdown
downloadReportBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  downloadMenu.style.display = downloadMenu.style.display === "block" ? "none" : "block";
});

// Close dropdown on click outside
document.addEventListener("click", () => {
  downloadMenu.style.display = "none";
});

async function getAttendanceData() {
  try {
    const response = await fetch(`${API_BASE}/api/attendance`, {
      headers: { 'ngrok-skip-browser-warning': '69420' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Oops! The server didn't return JSON. Make sure your backend is running the latest code.");
    }

    return await response.json();
  } catch (error) {
    alert("Error: " + error.message);
    return [];
  }
}

downloadExcelBtn.addEventListener("click", async () => {
  const data = await getAttendanceData();
  if (data.length === 0) return alert("No data to export");

  // Re-map data to ensure correct column order for Excel
  const formattedData = data.map(r => ({
    "Date": r.date,
    "Student Name": r.name,
    "Room No": r.room_no,
    "Meal Type": r.meal,
    "Status": r.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
  XLSX.writeFile(workbook, "attendance.xlsx");
});

downloadPdfBtn.addEventListener("click", async () => {
  const data = await getAttendanceData();
  if (data.length === 0) return alert("No data to export");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(31, 122, 107);
  doc.text("Canteen Attendance Report", 105, 15, { align: "center" });
  
  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Daily Report Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: "center" });
  
  const tableData = data.map(r => [r.date, r.name, r.room_no, r.meal, r.status]);
  
  doc.autoTable({
    startY: 30,
    head: [['Date', 'Student Name', 'Room No', 'Meal Type', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [31, 122, 107], halign: 'center' },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 }
    }
  });
  
  doc.save("attendance-report.pdf");
});

// --- Feedback ---
async function fetchFeedback() {
  feedbackList.innerHTML = '<div class="meta">Loading feedback...</div>';
  try {
    const response = await fetch(`${API_BASE}/api/feedback`, {
        headers: {
            'ngrok-skip-browser-warning': '69420'
        }
    });
    const data = await response.json();
    
    if (data.feedback && data.feedback.length > 0) {
      feedbackList.innerHTML = data.feedback.map(f => `
        <div class="feedback-item">
          <div class="feedback-header">
            <span>${f.meal}</span>
            <span>${f.date}</span>
          </div>
          <div class="feedback-comment">${f.comment}</div>
        </div>
      `).join('');
    } else {
      feedbackList.innerHTML = '<div class="meta">No feedback available</div>';
    }
  } catch (error) {
    feedbackList.innerHTML = '<div class="meta">Failed to load feedback</div>';
    console.error(error);
  }
}

// --- Timetable ---
timetableInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      timetablePreview.src = event.target.result;
      timetablePreview.style.display = "block";
      uploadPlaceholder.style.display = "none";
      uploadTimetableBtn.style.display = "flex";
    };
    reader.readAsDataURL(file);
  }
});

uploadTimetableBtn.addEventListener("click", async () => {
  const base64Image = timetablePreview.src;
  uploadStatus.textContent = "Uploading...";
  uploadTimetableBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/api/timetable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image })
    });

    const data = await response.json();

    if (response.ok) {
      uploadStatus.style.color = "var(--primary)";
      uploadStatus.textContent = "Timetable updated successfully!";
      setTimeout(() => { uploadStatus.textContent = ""; }, 3000);
    } else {
      throw new Error(data.message || "Upload failed");
    }
  } catch (error) {
    uploadStatus.style.color = "var(--danger-text)";
    uploadStatus.textContent = `Error: ${error.message}`;
  } finally {
    uploadTimetableBtn.disabled = false;
  }
});

// Initialize
fetchAttendance();
fetchFeedback();
