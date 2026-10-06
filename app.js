const API_BASE = "https://one-virus-website-production.up.railway.app";

const titleMap = {
  dashboard: "Security Dashboard",
  network: "Network Intelligence",
  bugbounty: "Authorized Security Lab",
  defense: "Defensive Security",
  codelab: "Code Lab",
  learning: "Learning Paths",
  tools: "Security Toolkit"
};

// =========================
// Navigation
// =========================

function showSection(id) {
  document.querySelectorAll(".section").forEach(s =>
    s.classList.toggle("active", s.id === id)
  );

  document.querySelectorAll(".nav-item").forEach(b =>
    b.classList.toggle("active", b.dataset.section === id)
  );

  const pageTitle = document.getElementById("page-title");

  if (pageTitle) {
    pageTitle.textContent = titleMap[id] || "One Virus";
  }

  history.replaceState(null, "", "#" + id);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

document.querySelectorAll("[data-section]").forEach(b => {
  b.addEventListener("click", () => showSection(b.dataset.section));
});

document.querySelectorAll("[data-go]").forEach(b => {
  b.addEventListener("click", () => showSection(b.dataset.go));
});

// =========================
// Theme
// =========================

const themeBtn = document.getElementById("themeBtn");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("soft");
  });
}

// =========================
// Tabs
// =========================

document.querySelectorAll(".tab").forEach(t => {
  t.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach(x => x.classList.remove("active"));

    t.classList.add("active");
  });
});

// =========================
// API Connection
// =========================

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(API_BASE + endpoint, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      detail: await response.text()
    };
  }

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || `API Error: ${response.status}`
    );
  }

  return data;
}

// =========================
// Backend Health
// =========================

async function checkBackend() {
  try {
    const data = await apiRequest("/api/health");

    console.log("ONE VIRUS BACKEND:", data);

    document.body.dataset.backend = "online";

    return data;
  } catch (error) {
    console.error("Backend connection failed:", error);

    document.body.dataset.backend = "offline";

    return null;
  }
}

// =========================
// Authentication
// =========================

async function login(username, password) {
  return apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password
    })
  });
}

async function logout() {
  return apiRequest("/api/logout", {
    method: "POST"
  });
}

async function getCurrentUser() {
  return apiRequest("/api/me");
}

// =========================
// Activity
// =========================

async function getActivity() {
  return apiRequest("/api/activity");
}

// =========================
// Network Tools
// =========================

async function getIPInfo(target) {
  return apiRequest(
    `/api/network/ip?target=${encodeURIComponent(target)}`
  );
}

async function getDNS(target) {
  return apiRequest(
    `/api/network/dns?target=${encodeURIComponent(target)}`
  );
}

async function getHeaders(target) {
  return apiRequest(
    `/api/network/headers?target=${encodeURIComponent(target)}`
  );
}

// =========================
// Defensive Security
// =========================

async function analyzeHash(hash) {
  return apiRequest("/api/defense/hash", {
    method: "POST",
    body: JSON.stringify({
      hash
    })
  });
}

async function analyzeLogs(logs) {
  return apiRequest("/api/defense/logs", {
    method: "POST",
    body: JSON.stringify({
      logs
    })
  });
}

// =========================
// Make API available to UI
// =========================

window.OneVirusAPI = {
  baseURL: API_BASE,

  request: apiRequest,

  health: checkBackend,

  login,
  logout,
  me: getCurrentUser,

  activity: getActivity,

  network: {
    ip: getIPInfo,
    dns: getDNS,
    headers: getHeaders
  },

  defense: {
    hash: analyzeHash,
    logs: analyzeLogs
  }
};

// =========================
// Start
// =========================

checkBackend();

const initial = location.hash.slice(1);

if (titleMap[initial]) {
  showSection(initial);
}
