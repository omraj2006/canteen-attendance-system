const STORAGE_KEYS = {
  role: "role",
  userId: "userId",
  userType: "userType",
  authMode: "authMode"
};

const DASHBOARD_ROUTES = {
  admin: "admin.html",
  hosteler: "hosteler-dashboard.html",
  "day-scholar": "day-scholar-dashboard.html",
  student: "hosteler-dashboard.html"
};

function setAuthState({ userId = "", role = "student", userType = "hosteler", authMode = "standard", name = "", email = "", room_no = "", couponCount = 0 }) {
  localStorage.setItem(STORAGE_KEYS.role, role);
  localStorage.setItem(STORAGE_KEYS.userId, userId);
  localStorage.setItem(STORAGE_KEYS.userType, userType);
  localStorage.setItem(STORAGE_KEYS.authMode, authMode);
  localStorage.setItem("userName", name);
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userRoom", room_no);
  localStorage.setItem("couponCount", couponCount);

  sessionStorage.setItem(STORAGE_KEYS.role, role);
  sessionStorage.setItem(STORAGE_KEYS.userId, userId);
  sessionStorage.setItem(STORAGE_KEYS.userType, userType);
  sessionStorage.setItem(STORAGE_KEYS.authMode, authMode);
}

function clearAuthState() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

function saveUserProfile(email, userType) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return;
  }

  const savedProfiles = JSON.parse(localStorage.getItem("userProfiles") || "{}");
  savedProfiles[normalizedEmail] = { userType };
  localStorage.setItem("userProfiles", JSON.stringify(savedProfiles));
}

function getUserTypeForEmail(email) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const savedProfiles = JSON.parse(localStorage.getItem("userProfiles") || "{}");
  return savedProfiles[normalizedEmail]?.userType || "hosteler";
}

function getRouteForUser(role, userType = "hosteler") {
  if (role === "admin") {
    return DASHBOARD_ROUTES.admin;
  }

  return DASHBOARD_ROUTES[userType] || DASHBOARD_ROUTES.student;
}

function redirectAfterLogin(role, userType) {
  window.location.href = getRouteForUser(role, userType);
}

function loginAsAdmin() {
  setAuthState({
    userId: "admin1",
    role: "admin",
    userType: "admin",
    authMode: "quick-admin"
  });

  redirectAfterLogin("admin", "admin");
}

// ✅ NEW: Automatic Session Check (Run this on Login/Signup pages)
function checkAuthOnPageLoad() {
  const role = localStorage.getItem(STORAGE_KEYS.role);
  const userType = localStorage.getItem(STORAGE_KEYS.userType);

  if (role && userType) {
    // If we are on login.html or signup.html, send to dashboard
    const path = window.location.pathname;
    if (path.includes("login.html") || path.includes("signup.html")) {
      redirectAfterLogin(role, userType);
    }
  }
}
