const role = localStorage.getItem("role");
const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName");
const userEmail = localStorage.getItem("userEmail");
let couponCount = parseInt(localStorage.getItem("couponCount") || "0");

// --- Auth Check ---
if (!userId || role !== "day-scholar") {
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
const couponWalletCount = document.getElementById("couponWalletCount");

function updateWalletUI(count) {
  const walletCard = document.getElementById("walletCard");
  const usedTodayCount = document.getElementById("usedTodayCount");
  const remainingCount = document.getElementById("remainingCount");
  
  if (couponWalletCount) {
    couponWalletCount.textContent = count;
  }
  if (remainingCount) remainingCount.textContent = count;

  // Visual state
  if (walletCard) {
    if (count <= 0) {
      walletCard.style.borderLeft = "6px solid var(--danger)";
    } else if (count <= 5) {
      walletCard.style.borderLeft = "6px solid var(--accent)";
    } else {
      walletCard.style.borderLeft = "6px solid var(--primary)";
    }
  }

  const btn = document.getElementById("showQrBtn");
  if (btn) {
    if (count <= 0) {
      btn.disabled = true;
      btn.textContent = "Refill to show QR";
      btn.style.opacity = "0.6";
      btn.style.cursor = "not-allowed";
      showAlert("You have 0 coupons left. Please buy more to eat at the canteen.", "danger");
    } else {
      btn.disabled = false;
      btn.textContent = "Show My QR";
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  }
}

function showAlert(msg, type = "info") {
  const alertArea = document.getElementById("dashboardAlerts");
  const alertMsg = document.getElementById("alertMessage");
  if (alertArea && alertMsg) {
    alertMsg.textContent = msg;
    alertArea.style.display = "block";
    
    const content = document.getElementById("alertContent");
    if (type === "danger") {
      content.style.background = "#fff1f0";
      content.style.color = "#b4372d";
      content.style.borderColor = "#f3c6c2";
    }
  }
}

async function fetchTransactions() {
  const list = document.getElementById("transactionList");
  if (!list) return;

  try {
    const data = await fetchWithHeader(`${BASE_URL}/api/user/transactions/${userId}`);
    if (data.length === 0) {
      list.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem; text-align: center; padding: 20px;">No transactions yet.</p>';
      return;
    }

    list.innerHTML = data.map(t => {
      const isBuy = t.type === "BUY";
      return `
        <div style="padding: 12px; border-radius: 12px; background: var(--surface); border-left: 4px solid ${isBuy ? 'var(--primary)' : 'var(--danger)'}; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">
              ${isBuy ? '🛒 Purchased Coupons' : `🍱 Used for ${t.meal}`}
            </div>
            <div style="font-size: 0.75rem; color: var(--muted);">${t.date} | ${t.time}</div>
          </div>
          <div style="font-weight: 700; color: ${isBuy ? 'var(--primary)' : 'var(--danger)'};">
            ${isBuy ? '+' : '-'}${t.amount}
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
  }
}

// Helper for ngrok headers
async function fetchWithHeader(url) {
  const response = await fetch(url, {
    headers: { 'ngrok-skip-browser-warning': '69420' }
  });
  return response.json();
}

// --- Profile Sync ---
async function syncProfile() {
  try {
    const data = await fetchWithHeader(`${BASE_URL}/api/user-profile/${userId}`);
    couponCount = data.couponCount;
    localStorage.setItem("couponCount", couponCount);
    updateWalletUI(couponCount);
    
    // Update Used Today
    const usageData = await fetchWithHeader(`${BASE_URL}/api/admin/coupon-usage-today`);
    const myUsage = usageData.filter(u => u.userId === userId).length;
    if (document.getElementById("usedTodayCount")) {
      document.getElementById("usedTodayCount").textContent = myUsage;
    }

    // Update History
    fetchTransactions();
  } catch (error) {
    console.error("Profile sync failed:", error);
  }
}

// Static notifications logic
function checkMealTime() {
  const hour = new Date().getHours();
  if (hour >= 12 && hour <= 15) {
    showAlert("Lunch time is active (12:00 PM - 3:00 PM)");
  } else if (hour >= 19 && hour <= 22) {
    showAlert("Dinner time is active (7:00 PM - 10:00 PM)");
  }
}

if (profileName) profileName.textContent = userName || "Student";
if (profileEmail) profileEmail.textContent = userEmail || "";
updateWalletUI(couponCount);
syncProfile();
checkMealTime();

// --- Logout ---
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearAuthState();
    window.location.href = "login.html";
  });
}

// --- Pricing Logic ---
const couponQuantityInput = document.getElementById("couponQuantity");
const pricePerCoupon = document.getElementById("pricePerCoupon");
const totalPriceDisplay = document.getElementById("totalPriceDisplay");

function updatePricing() {
  const qty = parseInt(couponQuantityInput.value) || 0;
  const price = qty > 10 ? 60 : 80;
  const total = qty * price;
  
  if (pricePerCoupon) pricePerCoupon.textContent = `₹${price}`;
  if (totalPriceDisplay) totalPriceDisplay.textContent = `₹${total}`;
}

if (couponQuantityInput) {
  couponQuantityInput.addEventListener("input", updatePricing);
}

// --- Buy Coupons ---
const buyCouponsBtn = document.getElementById("buyCouponsBtn");
const purchaseSuccessOverlay = document.getElementById("purchaseSuccessOverlay");
const closeSuccessBtn = document.getElementById("closeSuccessBtn");

if (buyCouponsBtn) {
  buyCouponsBtn.addEventListener("click", async () => {
    const qty = parseInt(couponQuantityInput.value) || 0;
    if (qty <= 0) return alert("Please enter a valid quantity.");

    buyCouponsBtn.disabled = true;
    buyCouponsBtn.textContent = "Processing...";

    try {
      const response = await fetch(`${BASE_URL}/api/buy-coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, quantity: qty })
      });

      const data = await response.json();
      if (response.ok) {
        // Update state
        couponCount = data.couponCount;
        localStorage.setItem("couponCount", couponCount);
        updateWalletUI(couponCount);
        fetchTransactions();
        
        // Show success overlay
        purchaseSuccessOverlay.classList.add("active");
      } else {
        throw new Error(data.message || "Purchase failed");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      buyCouponsBtn.disabled = false;
      buyCouponsBtn.textContent = "Buy Now";
    }
  });
}

if (closeSuccessBtn) {
  closeSuccessBtn.addEventListener("click", () => {
    purchaseSuccessOverlay.classList.remove("active");
  });
}

// --- QR Modal ---
const showQrBtn = document.getElementById("showQrBtn");
const qrModal = document.getElementById("qrModal");
const closeQrBtn = document.getElementById("closeQrBtn");
const qrcodeContainer = document.getElementById("qrcode");
let qrGenerated = false;

if (showQrBtn) {
  showQrBtn.addEventListener("click", () => {
    if (!qrGenerated) {
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
