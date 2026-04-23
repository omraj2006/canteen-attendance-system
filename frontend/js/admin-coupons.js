async function fetchCouponStats() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/coupon-stats`, {
      headers: { 'ngrok-skip-browser-warning': '69420' }
    });
    const data = await res.json();
    
    document.getElementById("totalScholars").textContent = data.totalDayScholars;
    document.getElementById("activeUsers").textContent = data.activeUsers;
    document.getElementById("inactiveUsers").textContent = data.inactiveUsers;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
  }
}

let allDayScholars = [];

async function fetchUserList() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/day-scholars`, {
      headers: { 'ngrok-skip-browser-warning': '69420' }
    });
    allDayScholars = await res.json();
    renderUserList(allDayScholars);
  } catch (error) {
    console.error("Failed to fetch user list:", error);
  }
}

function renderUserList(users) {
  const body = document.getElementById("userListBody");
  if (!body) return;
  
  if (users.length === 0) {
    body.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--muted); padding: 20px;">No users found</td></tr>';
    return;
  }

  body.innerHTML = users.map(user => {
    const isActive = user.couponCount > 0;
    return `
      <tr>
        <td style="font-weight: 600;">${user.name}</td>
        <td style="color: var(--muted);">${user.email}</td>
        <td style="font-weight: 700;">${user.couponCount}</td>
        <td>
          <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
            ${isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
      </tr>
    `;
  }).join("");
}

// Search Logic
const userSearchInput = document.getElementById("userSearchInput");
if (userSearchInput) {
  userSearchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allDayScholars.filter(u => 
      u.name.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query)
    );
    renderUserList(filtered);
  });
}

async function fetchUsageToday() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/coupon-usage-today`, {
      headers: { 'ngrok-skip-browser-warning': '69420' }
    });
    const usage = await res.json();
    
    document.getElementById("totalUsedToday").textContent = usage.length;

    const body = document.getElementById("usageTodayBody");
    if (usage.length === 0) {
      body.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--muted); padding: 20px;">No coupons used today</td></tr>';
      return;
    }

    body.innerHTML = usage.map(record => `
      <tr>
        <td style="font-weight: 600;">${record.name}</td>
        <td style="color: var(--primary); font-weight: 600;">${record.meal || 'N/A'}</td>
        <td style="color: var(--muted);">${record.timeUsed || '--:--'}</td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Failed to fetch today's usage:", error);
  }
}

// Initial Load
function init() {
  fetchCouponStats();
  fetchUserList();
  fetchUsageToday();
}

init();
