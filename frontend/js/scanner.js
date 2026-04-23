const role = localStorage.getItem("role");
const API_BASE = BASE_URL;

if (role !== "admin") {
  alert("Access denied");
  window.location.href = "login.html";
} else {
  const readerId = "reader";
  const scanner = new Html5Qrcode(readerId);
  const statusBox = document.getElementById("status");
  const mealTypeSelect = document.getElementById("mealType");
  let isScannerRunning = false;
  let restartTimer = null;

  function setStatus(message, type = "") {
    statusBox.className = "status" + (type ? ` ${type}` : "");
    statusBox.textContent = message;
  }

  async function startScanner() {
    if (isScannerRunning) {
      return;
    }

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 }
        },
        onScanSuccess
      );

      isScannerRunning = true;
      setStatus("Scanner is active. Point the camera at a student QR code.");
    } catch (error) {
      setStatus(`Unable to start scanner: ${error}`, "error");
    }
  }

  async function stopScanner() {
    if (!isScannerRunning) {
      return;
    }

    await scanner.stop();
    await scanner.clear();
    isScannerRunning = false;
  }

  async function onScanSuccess(decodedText) {
    const userId = decodedText.trim();
    const mealType = mealTypeSelect.value;

    clearTimeout(restartTimer);

    try {
      await stopScanner();
      setStatus(`Scanned user ${userId}. Processing...`);

      // 1. Try to Mark Attendance (Hostelers)
      const attendanceRes = await fetch(`${BASE_URL}/mark-attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mealType })
      });

      const attendanceData = await attendanceRes.json();

      if (attendanceRes.ok) {
        setStatus(`✅ ${attendanceData.name} [${attendanceData.role}]\nAttendance Marked!`, "success");
      } else if (attendanceRes.status === 404 || attendanceData.message.includes("Day Scholars must use coupons")) {
        // 2. Try using a coupon
        const couponRes = await fetch(`${BASE_URL}/api/use-coupon`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, mealType })
        });

        const couponData = await couponRes.json();

        if (couponRes.ok) {
          setStatus(`🎟️ ${couponData.name} [${couponData.role}]\nCoupon Used! Remaining: ${couponData.remainingCoupons}`, "success");
        } else {
          setStatus(`❌ Error: ${couponData.message}`, "error");
        }
      } else {
        setStatus(`❌ Error: ${attendanceData.message}`, "error");
      }
    } catch (error) {
      setStatus(`Scan processing failed: ${error.message}.`, "error");
    }

    restartTimer = setTimeout(() => {
      startScanner();
    }, 3000);
  }

  startScanner();
}
