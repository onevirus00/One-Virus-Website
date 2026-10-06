/* =========================================================
   ONE VIRUS - FRONTEND ENGINE
   Virus AI + Security Toolkit + Network + Code Runner
   ========================================================= */

const API_BASE = "https://one-virus-website-production.up.railway.app";

/* =========================
   BASIC NAVIGATION
   ========================= */

const titleMap = {
  dashboard: "Security Dashboard",
  network: "Network Intelligence",
  bugbounty: "Authorized Security Lab",
  defense: "Defensive Security",
  codelab: "Code Lab",
  learning: "Learning Paths",
  tools: "Security Toolkit"
};

function showSection(id) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.toggle("active", section.id === id);
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.section === id);
  });

  const title = document.getElementById("page-title");
  if (title) {
    title.textContent = titleMap[id] || "One Virus";
  }

  history.replaceState(null, "", "#" + id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-section]").forEach(button => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showSection(button.dataset.go);
  });
});

const themeBtn = document.getElementById("themeBtn");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("soft");
  });
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => {
      x.classList.remove("active");
    });

    tab.classList.add("active");
  });
});

/* =========================
   API HELPER
   ========================= */

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(API_BASE + endpoint, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.detail || `HTTP ${response.status}`);
  }

  return data;
}

/* =========================
   BACKEND STATUS
   ========================= */

async function checkBackend() {
  const status =
    document.getElementById("backendStatus") ||
    document.getElementById("backend-status");

  if (!status) return;

  try {
    const data = await apiRequest("/api/health");

    status.textContent = data.status
      ? `Backend: ${data.status}`
      : "Backend: Online";

    status.classList.add("online");
    status.classList.remove("offline");
  } catch {
    status.textContent = "Backend: Offline";

    status.classList.add("offline");
    status.classList.remove("online");
  }
}

/* =========================================================
   VIRUS AI
   ========================================================= */

function createVirusAI() {
  const section = document.getElementById("codelab");

  if (!section) return;

  if (document.getElementById("virus-ai-container")) return;

  const wrapper = document.createElement("div");

  wrapper.id = "virus-ai-container";

  wrapper.innerHTML = `
    <div class="ov-ai-panel">

      <div class="ov-ai-header">
        <div>
          <div class="ov-ai-title">☣ Virus AI</div>
          <div class="ov-ai-subtitle">
            Programming & Defensive Cybersecurity Assistant
          </div>
        </div>

        <div class="ov-ai-status">
          ● READY
        </div>
      </div>

      <div id="virus-ai-messages" class="ov-ai-messages">
        <div class="ov-ai-message ai">
          <strong>Virus AI</strong>
          <p>
            أهلاً بيك. أنا Virus AI.
            اسألني عن Python أو JavaScript أو البرمجة
            أو تحليل الأخطاء أو الأمن السيبراني الدفاعي.
          </p>
        </div>
      </div>

      <div class="ov-ai-tools">
        <button data-ai-prompt="اشرح لي هذا الكود">
          Explain Code
        </button>

        <button data-ai-prompt="ساعدني أصلح الخطأ الموجود في الكود">
          Fix Error
        </button>

        <button data-ai-prompt="راجع الكود من ناحية الأمان">
          Security Review
        </button>

        <button data-ai-prompt="علمني Python من البداية">
          Learn Python
        </button>
      </div>

      <div class="ov-ai-input-row">
        <textarea
          id="virus-ai-input"
          placeholder="اكتب سؤالك لـ Virus AI..."
        ></textarea>

        <button id="virus-ai-send">
          SEND
        </button>
      </div>

    </div>
  `;

  section.prepend(wrapper);

  document.querySelectorAll("[data-ai-prompt]").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById("virus-ai-input");

      if (!input) return;

      input.value = button.dataset.aiPrompt;
      input.focus();
    });
  });

  const sendButton = document.getElementById("virus-ai-send");

  if (sendButton) {
    sendButton.addEventListener("click", sendVirusAI);
  }
}

function addAIMessage(type, text) {
  const box = document.getElementById("virus-ai-messages");

  if (!box) return;

  const message = document.createElement("div");

  message.className = `ov-ai-message ${type}`;

  message.innerHTML = `
    <strong>${type === "user" ? "You" : "Virus AI"}</strong>
    <p>${escapeHTML(text).replace(/\n/g, "<br>")}</p>
  `;

  box.appendChild(message);

  box.scrollTop = box.scrollHeight;
}

async function sendVirusAI() {
  const input = document.getElementById("virus-ai-input");
  const button = document.getElementById("virus-ai-send");

  if (!input) return;

  const message = input.value.trim();

  if (!message) return;

  addAIMessage("user", message);

  input.value = "";

  if (button) {
    button.disabled = true;
    button.textContent = "THINKING...";
  }

  try {
    /*
      لو الـbackend فيه /api/ai/chat
      هنستخدمه تلقائياً.
    */

    const result = await apiRequest("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        context: {
          app: "One Virus",
          mode: "programming-cybersecurity"
        }
      })
    });

    addAIMessage(
      "ai",
      result.reply ||
      result.message ||
      "لم يصل رد من Virus AI."
    );

  } catch {
    /*
      Fallback محلي لحد ما نوصل AI الحقيقي بالbackend.
    */

    const reply = localVirusAI(message);

    addAIMessage("ai", reply);
  }

  if (button) {
    button.disabled = false;
    button.textContent = "SEND";
  }
}

function localVirusAI(message) {
  const text = message.toLowerCase();

  if (
    text.includes("python") ||
    text.includes("بايثون")
  ) {
    return `
Python لغة ممتازة للبرمجة والأتمتة وتحليل البيانات.

مثال:

print("Hello One Virus")

ولو عندك Error ابعتهولي وأنا أشرحلك سببه وطريقة إصلاحه.
`;
  }

  if (
    text.includes("javascript") ||
    text.includes("جافاسكريبت")
  ) {
    return `
JavaScript هي اللغة الأساسية لتفاعل صفحات الويب.

مثال:

const name = "One Virus";
console.log(name);

ابعتلي الكود لو عايز شرح أو Debugging.
`;
  }

  if (
    text.includes("error") ||
    text.includes("خطأ") ||
    text.includes("bug")
  ) {
    return `
تمام. ابعتلي:

1. الكود
2. رسالة الخطأ
3. اللغة المستخدمة

وسأحدد مكان المشكلة وأشرح طريقة إصلاحها.
`;
  }

  if (
    text.includes("security") ||
    text.includes("أمان") ||
    text.includes("cyber")
  ) {
    return `
أقدر أساعدك في الأمن السيبراني الدفاعي مثل:

• Secure Coding
• تحليل Logs
• HTTP Security Headers
• DNS
• Network Concepts
• Hashing
• Authentication
• Vulnerability Awareness
• Code Security Review

استخدم الأدوات فقط على الأنظمة المصرح لك باختبارها.
`;
  }

  return `
أنا Virus AI.

أقدر أساعدك في:

• Python
• JavaScript
• C / C++
• Java
• Go
• Rust
• PHP
• Bash
• Web Development
• Debugging
• Secure Coding
• Defensive Cybersecurity
• Network Concepts

اكتب سؤالك بالتفصيل أو الصق الكود هنا.
`;
}

/* =========================================================
   CODE RUNNER
   ========================================================= */

function createCodeRunner() {
  const section = document.getElementById("codelab");

  if (!section) return;

  if (document.getElementById("virus-code-runner")) return;

  const runner = document.createElement("div");

  runner.id = "virus-code-runner";

  runner.innerHTML = `
    <div class="ov-runner">

      <div class="ov-runner-header">

        <div>
          <strong>Code Runner</strong>
          <span>Integrated Terminal</span>
        </div>

        <select id="ov-language">
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="bash">Bash</option>
          <option value="powershell">PowerShell</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
        </select>

      </div>

      <div class="ov-runner-body">

        <div class="ov-editor">

          <div class="ov-editor-title">
            <span>CODE</span>

            <div>
              <button id="ov-run">▶ RUN</button>
              <button id="ov-clear">CLEAR</button>
              <button id="ov-ai-code">☣ AI REVIEW</button>
            </div>
          </div>

          <textarea
            id="ov-code"
            spellcheck="false"
          >print("Hello from One Virus")</textarea>

        </div>

        <div class="ov-terminal">

          <div class="ov-terminal-title">
            TERMINAL
          </div>

          <pre id="ov-terminal-output">One Virus Terminal
Ready.

$ </pre>

          <div class="ov-terminal-input-row">
            <span>$</span>

            <input
              id="ov-terminal-input"
              placeholder="Terminal command..."
            />
          </div>

        </div>

      </div>

    </div>
  `;

  section.appendChild(runner);

  document
    .getElementById("ov-run")
    ?.addEventListener("click", runCode);

  document
    .getElementById("ov-clear")
    ?.addEventListener("click", () => {
      const code = document.getElementById("ov-code");

      if (code) {
        code.value = "";
      }
    });

  document
    .getElementById("ov-ai-code")
    ?.addEventListener("click", () => {
      const code = document.getElementById("ov-code");

      const input = document.getElementById("virus-ai-input");

      if (!code || !input) return;

      input.value =
        "راجع الكود التالي أمنياً واشرح لي المشاكل:\n\n" +
        code.value;

      input.focus();

      document
        .getElementById("virus-ai-container")
        ?.scrollIntoView({
          behavior: "smooth"
        });
    });

  document
    .getElementById("ov-terminal-input")
    ?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        executeTerminalCommand();
      }
    });
}

async function runCode() {
  const code = document.getElementById("ov-code")?.value || "";
  const language =
    document.getElementById("ov-language")?.value || "python";

  const terminal =
    document.getElementById("ov-terminal-output");

  if (!terminal) return;

  if (!code.trim()) {
    terminal.textContent += "\nNo code to run.\n$ ";
    return;
  }

  terminal.textContent +=
    `\n[RUNNING ${language.toUpperCase()}]\n`;

  /*
    التنفيذ الحقيقي لازم يحصل في sandbox على السيرفر.
    لما endpoint /api/code/run يتضاف،
    الكود هنا هيستعمله تلقائياً.
  */

  try {
    const result = await apiRequest("/api/code/run", {
      method: "POST",
      body: JSON.stringify({
        language,
        code
      })
    });

    terminal.textContent +=
      (result.output || result.stdout || "") +
      "\n$ ";

  } catch {
    terminal.textContent +=
      "\nCode execution backend is not connected yet." +
      "\nThe runner UI is ready." +
      "\n$ ";
  }

  terminal.scrollTop = terminal.scrollHeight;
}

async function executeTerminalCommand() {
  const input = document.getElementById("ov-terminal-input");
  const terminal =
    document.getElementById("ov-terminal-output");

  if (!input || !terminal) return;

  const command = input.value.trim();

  if (!command) return;

  terminal.textContent += `\n$ ${command}`;

  input.value = "";

  /*
    Commands يتم تنفيذها على sandbox backend فقط.
  */

  try {
    const result = await apiRequest("/api/terminal", {
      method: "POST",
      body: JSON.stringify({
        command
      })
    });

    terminal.textContent +=
      "\n" +
      (result.output || result.stdout || "Command completed.") +
      "\n";

  } catch {
    terminal.textContent +=
      "\nTerminal backend is not connected yet.\n";
  }

  terminal.textContent += "$ ";
  terminal.scrollTop = terminal.scrollHeight;
}

/* =========================================================
   SECURITY TOOLKIT
   ========================================================= */

function createSecurityToolkit() {
  const section = document.getElementById("tools");

  if (!section) return;

  if (document.getElementById("ov-toolkit")) return;

  const toolkit = document.createElement("div");

  toolkit.id = "ov-toolkit";

  toolkit.innerHTML = `
    <div class="ov-toolkit">

      <div class="ov-toolkit-header">
        <div>
          <h2>Security Toolkit</h2>
          <p>Defensive security utilities</p>
        </div>
      </div>

      <div class="ov-tools-grid">

        <div class="ov-tool-card">
          <h3>Base64</h3>
          <textarea id="tool-base64-input"
            placeholder="Text..."></textarea>

          <div>
            <button id="base64-encode">ENCODE</button>
            <button id="base64-decode">DECODE</button>
          </div>

          <pre id="tool-base64-output"></pre>
        </div>

        <div class="ov-tool-card">
          <h3>Hash Generator</h3>

          <textarea
            id="tool-hash-input"
            placeholder="Text to hash..."
          ></textarea>

          <button id="hash-generate">
            SHA-256
          </button>

          <pre id="tool-hash-output"></pre>
        </div>

        <div class="ov-tool-card">
          <h3>JSON Formatter</h3>

          <textarea
            id="tool-json-input"
            placeholder='{"name":"One Virus"}'
          ></textarea>

          <button id="json-format">
            FORMAT JSON
          </button>

          <pre id="tool-json-output"></pre>
        </div>

        <div class="ov-tool-card">
          <h3>URL Analyzer</h3>

          <input
            id="tool-url-input"
            placeholder="https://example.com"
          />

          <button id="url-analyze">
            ANALYZE
          </button>

          <pre id="tool-url-output"></pre>
        </div>

        <div class="ov-tool-card">
          <h3>Regex Tester</h3>

          <input
            id="regex-pattern"
            placeholder="Regex pattern"
          />

          <textarea
            id="regex-text"
            placeholder="Text..."
          ></textarea>

          <button id="regex-test">
            TEST
          </button>

          <pre id="regex-output"></pre>
        </div>

        <div class="ov-tool-card">
          <h3>Password Generator</h3>

          <input
            id="password-length"
            type="number"
            min="8"
            max="128"
            value="20"
          />

          <button id="password-generate">
            GENERATE
          </button>

          <pre id="password-output"></pre>
        </div>

      </div>

    </div>
  `;

  section.appendChild(toolkit);

  document
    .getElementById("base64-encode")
    ?.addEventListener("click", () => {
      const value =
        document.getElementById("tool-base64-input").value;

      document.getElementById("tool-base64-output").textContent =
        btoa(unescape(encodeURIComponent(value)));
    });

  document
    .getElementById("base64-decode")
    ?.addEventListener("click", () => {
      try {
        const value =
          document.getElementById("tool-base64-input").value;

        document.getElementById("tool-base64-output").textContent =
          decodeURIComponent(
            escape(atob(value))
          );
      } catch {
        document.getElementById("tool-base64-output").textContent =
          "Invalid Base64.";
      }
    });

  document
    .getElementById("hash-generate")
    ?.addEventListener("click", generateHash);

  document
    .getElementById("json-format")
    ?.addEventListener("click", formatJSON);

  document
    .getElementById("url-analyze")
    ?.addEventListener("click", analyzeURL);

  document
    .getElementById("regex-test")
    ?.addEventListener("click", testRegex);

  document
    .getElementById("password-generate")
    ?.addEventListener("click", generatePassword);
}

async function generateHash() {
  const value =
    document.getElementById("tool-hash-input").value;

  const output =
    document.getElementById("tool-hash-output");

  if (!value) {
    output.textContent = "Enter text first.";
    return;
  }

  const data = new TextEncoder().encode(value);

  const hash =
    await crypto.subtle.digest("SHA-256", data);

  const hex = [...new Uint8Array(hash)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");

  output.textContent = hex;
}

function formatJSON() {
  const input =
    document.getElementById("tool-json-input").value;

  const output =
    document.getElementById("tool-json-output");

  try {
    const object = JSON.parse(input);

    output.textContent =
      JSON.stringify(object, null, 2);

  } catch (error) {
    output.textContent =
      "Invalid JSON:\n" + error.message;
  }
}

function analyzeURL() {
  const input =
    document.getElementById("tool-url-input").value;

  const output =
    document.getElementById("tool-url-output");

  try {
    const url = new URL(input);

    output.textContent =
`Protocol: ${url.protocol}
Hostname: ${url.hostname}
Port: ${url.port || "default"}
Path: ${url.pathname}
Query: ${url.search || "none"}
Hash: ${url.hash || "none"}`;

  } catch {
    output.textContent = "Invalid URL.";
  }
}

function testRegex() {
  const pattern =
    document.getElementById("regex-pattern").value;

  const text =
    document.getElementById("regex-text").value;

  const output =
    document.getElementById("regex-output");

  try {
    const regex = new RegExp(pattern, "g");

    const matches = text.match(regex);

    output.textContent =
      matches
        ? matches.join("\n")
        : "No matches.";
  } catch (error) {
    output.textContent =
      "Invalid Regex:\n" + error.message;
  }
}

function generatePassword() {
  const length =
    Number(document.getElementById("password-length").value) || 20;

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";

  const array = new Uint32Array(length);

  crypto.getRandomValues(array);

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }

  document.getElementById("password-output").textContent =
    password;
}

/* =========================================================
   NETWORK TOOLS
   ========================================================= */

async function setupNetworkTools() {

  const ipButton =
    document.getElementById("ipAnalyzeBtn");

  if (ipButton) {
    ipButton.addEventListener("click", async () => {

      const target =
        document.getElementById("ipTarget").value;

      const result =
        document.getElementById("ipResult");

      if (!target) {
        result.textContent = "Enter IP or domain.";
        return;
      }

      result.textContent = "Analyzing...";

      try {

        const data = await apiRequest("/api/network/ip", {
          method: "POST",
          body: JSON.stringify({
            target
          })
        });

        result.textContent =
          JSON.stringify(data, null, 2);

      } catch (error) {

        result.textContent =
          "Network backend unavailable.\n" +
          error.message;
      }
    });
  }

  const dnsButton =
    document.getElementById("dnsLookupBtn");

  if (dnsButton) {
    dnsButton.addEventListener("click", async () => {

      const target =
        document.getElementById("dnsTarget").value;

      const result =
        document.getElementById("dnsResult");

      if (!target) return;

      result.textContent = "Looking up DNS...";

      try {

        const data =
          await apiRequest("/api/network/dns", {
            method: "POST",
            body: JSON.stringify({
              target
            })
          });

        result.textContent =
          JSON.stringify(data, null, 2);

      } catch (error) {

        result.textContent =
          "DNS backend unavailable.\n" +
          error.message;
      }
    });
  }

  const headersButton =
    document.getElementById("headersInspectBtn");

  if (headersButton) {
    headersButton.addEventListener("click", async () => {

      const target =
        document.getElementById("headersTarget").value;

      const result =
        document.getElementById("headersResult");

      if (!target) return;

      result.textContent =
        "Inspecting HTTP headers...";

      try {

        const data =
          await apiRequest("/api/network/headers", {
            method: "POST",
            body: JSON.stringify({
              target
            })
          });

        result.textContent =
          JSON.stringify(data, null, 2);

      } catch (error) {

        result.textContent =
          "Headers backend unavailable.\n" +
          error.message;
      }
    });
  }
}

/* =========================================================
   DEFENSIVE TOOLS
   ========================================================= */

function setupDefenseTools() {

  const hashButton =
    document.getElementById("hashAnalyzeBtn");

  if (hashButton) {
    hashButton.addEventListener("click", async () => {

      const value =
        document.getElementById("hashInput").value;

      const result =
        document.getElementById("hashResult");

      if (!value) return;

      result.textContent =
        "Analyzing hash format...";

      try {

        const data =
          await apiRequest("/api/defense/hash", {
            method: "POST",
            body: JSON.stringify({
              value
            })
          });

        result.textContent =
          JSON.stringify(data, null, 2);

      } catch (error) {

        result.textContent =
          "Defense backend unavailable.\n" +
          error.message;
      }
    });
  }

  const logsButton =
    document.getElementById("logsAnalyzeBtn");

  if (logsButton) {
    logsButton.addEventListener("click", async () => {

      const value =
        document.getElementById("logsInput").value;

      const result =
        document.getElementById("logsResult");

      if (!value) return;

      result.textContent =
        "Analyzing logs...";

      try {

        const data =
          await apiRequest("/api/defense/logs", {
            method: "POST",
            body: JSON.stringify({
              text: value
            })
          });

        result.textContent =
          JSON.stringify(data, null, 2);

      } catch (error) {

        result.textContent =
          "Log analysis backend unavailable.\n" +
          error.message;
      }
    });
  }
}

/* =========================================================
   SECURITY HELPERS
   ========================================================= */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function setupMobileSidebar() {

  const sidebar =
    document.querySelector(".sidebar");

  if (!sidebar) return;

  let startX = 0;

  document.addEventListener("touchstart", event => {
    startX = event.touches[0].clientX;
  });

  document.addEventListener("touchend", event => {

    const endX = event.changedTouches[0].clientX;
    const difference = endX - startX;

    if (Math.abs(difference) < 70) return;

    if (difference > 0 && startX < 80) {
      sidebar.classList.add("open");
    }

    if (difference < 0) {
      sidebar.classList.remove("open");
    }
  });
}

/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  createVirusAI();

  createCodeRunner();

  createSecurityToolkit();

  setupNetworkTools();

  setupDefenseTools();

  setupMobileSidebar();

  checkBackend();

  const initial =
    location.hash.slice(1);

  if (titleMap[initial]) {
    showSection(initial);
  }

  console.log(
    "%c☣ One Virus",
    "color:#00ff9c;font-size:22px;font-weight:bold"
  );

  console.log(
    "%cVirus AI initialized.",
    "color:#00d9ff"
  );

});
