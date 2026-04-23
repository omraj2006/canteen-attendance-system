const loginForm = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");
const messageBox = document.getElementById("message");
const adminLoginBtn = document.getElementById("adminLoginBtn");

const API_BASE = BASE_URL;

function showError(text) {
  messageBox.textContent = text;
  messageBox.className = "message error";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const emailOrId = formData.get("email").trim(); // Label is Email but it accepts ID too
  const password = formData.get("password");

  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";
  messageBox.className = "message";
  messageBox.textContent = "";

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrId, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Invalid credentials");
    }

    // --- NEW: Handle Activation Flow ---
    if (data.isActivated === false) {
      localStorage.setItem("tempUserId", data.userId);
      localStorage.setItem("tempUserName", data.name);
      window.location.href = "activation.html";
      return;
    }

    const userType = data.role === "hosteler" ? "hosteler" : (data.role === "admin" ? "admin" : "day-scholar");

    setAuthState({
      userId: data.userId,
      role: data.role,
      userType,
      authMode: "standard",
      name: data.name,
      email: data.email,
      room_no: data.room_no,
      couponCount: data.couponCount
    });

    redirectAfterLogin(data.role, userType);
  } catch (error) {
    showError(error.message || "Invalid credentials");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Login";
  }
});

adminLoginBtn.addEventListener("click", () => {
  loginAsAdmin();
});
