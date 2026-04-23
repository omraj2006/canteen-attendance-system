async function fetchWithHeader(url) {
  const response = await fetch(url, {
    headers: { 'ngrok-skip-browser-warning': '69420' }
  });
  return response.json();
}

async function renderUsageChart() {
  const data = await fetchWithHeader(`${BASE_URL}/api/admin/analytics/usage-7days`);
  const ctx = document.getElementById('usageChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: 'Coupons Used',
        data: data.map(d => d.count),
        borderColor: '#1f7a6b',
        backgroundColor: 'rgba(31, 122, 107, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#1f7a6b',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
        x: { grid: { display: false } }
      }
    }
  });
}

async function renderMealChart() {
  const data = await fetchWithHeader(`${BASE_URL}/api/admin/analytics/meal-distribution`);
  const ctx = document.getElementById('mealChart').getContext('2d');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Lunch', 'Dinner'],
      datasets: [{
        data: [data.lunch, data.dinner],
        backgroundColor: ['#1f7a6b', '#ff9800'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      },
      cutout: '70%'
    }
  });
}

async function renderUserStatusChart() {
  const data = await fetchWithHeader(`${BASE_URL}/api/admin/coupon-stats`);
  const ctx = document.getElementById('userStatusChart').getContext('2d');

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Active (Balance > 0)', 'Inactive (Zero Balance)'],
      datasets: [{
        data: [data.activeUsers, data.inactiveUsers],
        backgroundColor: ['#1f7a6b', '#b4372d'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

async function init() {
  try {
    await Promise.all([
      renderUsageChart(),
      renderMealChart(),
      renderUserStatusChart()
    ]);
  } catch (error) {
    console.error("Failed to render charts:", error);
  }
}

init();
