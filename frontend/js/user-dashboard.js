const role = localStorage.getItem("role");
const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName");
const userEmail = localStorage.getItem("userEmail");
const userRoom = localStorage.getItem("userRoom");

// --- Auth Check ---
if (!userId || role === "admin") {
  window.location.href = "login.html";
}

// --- Sidebar Toggle ---
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

if (menuToggle && sidebar && overlay) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  });
}

// --- Profile Info ---
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileRoom = document.getElementById("profileRoom");

if (profileName) profileName.textContent = userName || "Student";
if (profileEmail) profileEmail.textContent = userEmail || "";

if (profileRoom) {
  if (role === "day-scholar" || !userRoom || userRoom === "N/A") {
    profileRoom.style.display = "none";
  } else {
    profileRoom.textContent = `Room: ${userRoom}`;
    profileRoom.style.display = "block";
  }
}

// --- Navigation & QR ---
const qrCard = document.getElementById("qrCard");
const qrModal = document.getElementById("qrModal");
const closeQrBtn = document.getElementById("closeQrBtn");
const qrcodeContainer = document.getElementById("qrcode");
let qrGenerated = false;

if (qrCard) {
  qrCard.addEventListener("click", () => {
    if (!qrGenerated && qrcodeContainer) {
      new QRCode(qrcodeContainer, {
        text: userId,
        width: 200,
        height: 200
      });
      qrGenerated = true;
    }
    qrModal.classList.add("active");
  });
}

if (closeQrBtn) {
  closeQrBtn.addEventListener("click", () => {
    qrModal.classList.remove("active");
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearAuthState();
    window.location.href = "login.html";
  });
}

// --- Attendance History ---
async function fetchAttendanceHistory() {
  const list = document.getElementById("attendanceHistoryList");
  if (!list) return;

  try {
    const response = await fetch(`${BASE_URL}/api/attendance`, {
      headers: { 'ngrok-skip-browser-warning': '69420' }
    });
    const allRecords = await response.json();
    
    // Filter for THIS student
    const myRecords = allRecords.filter(r => r.name === userName || r.room_no === userRoom);

    if (myRecords.length === 0) {
      list.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem; text-align: center; padding: 20px;">No attendance logged yet.</p>';
      return;
    }

    list.innerHTML = myRecords.slice(0, 10).map(r => `
      <div class="history-item">
        <div class="history-info">
          <h4>${r.meal}</h4>
          <p>${r.date} | ${r.time}</p>
        </div>
        <div style="color: var(--primary); font-weight: 700; font-size: 0.8rem;">✓ PRESENT</div>
      </div>
    `).join("");
  } catch (error) {
    console.error("Failed to fetch history:", error);
    list.innerHTML = '<p style="color: #b4372d; font-size: 0.8rem; text-align: center;">Error loading history</p>';
  }
}

// --- Feedback Submission ---
const feedbackForm = document.getElementById("feedbackForm");
const feedbackStatus = document.getElementById("feedbackStatus");
const feedbackSubmitBtn = document.getElementById("feedbackSubmitBtn");

if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mealType = document.getElementById("mealType").value;
    const comment = document.getElementById("comment").value;

    feedbackSubmitBtn.disabled = true;
    feedbackStatus.textContent = "Submitting...";

    try {
      const response = await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mealType, 
          comment, 
          user: userName || userId 
        })
      });

      if (response.ok) {
        feedbackStatus.style.color = "var(--primary)";
        feedbackStatus.textContent = "Thank you for your feedback!";
        feedbackForm.reset();
        setTimeout(() => { feedbackStatus.textContent = ""; }, 3000);
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      feedbackStatus.style.color = "#b4372d";
      feedbackStatus.textContent = "Error submitting feedback. Try again.";
    } finally {
      feedbackSubmitBtn.disabled = false;
    }
  });
}

// --- Timetable Logic ---
async function fetchTimetable() {
  const display = document.getElementById("timetableDisplay");
  const emptyMsg = document.getElementById("timetableEmpty");
  if (!display) return;

  try {
    const response = await fetch(`${BASE_URL}/api/get-timetable`, {
        headers: {
            'ngrok-skip-browser-warning': '69420'
        }
    });
    const data = await response.json();

    if (data.timetable) {
      display.src = data.timetable;
      display.style.display = "block";
      if (emptyMsg) emptyMsg.style.display = "none";
    }
  } catch (error) {
    console.error("Failed to load timetable:", error);
  }
}

fetchTimetable();
fetchAttendanceHistory();
