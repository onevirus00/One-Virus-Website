/* =========================================================
   ONE VIRUS
   Frontend Application
   Virus AI + Code Runner + Security Toolkit + Network
   ========================================================= */

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

/* =========================================================
   NAVIGATION
   ========================================================= */

function showSection(id) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.toggle("active", section.id === id);
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.section === id
    );
  });

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

/* =========================================================
   THEME
   ========================================================= */

const themeBtn = document.getElementById("themeBtn");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("soft");
  });
}

/* =========================================================
   TABS
   ========================================================= */

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(item => {
      item.classList.remove("active");
    });

    tab.classList.add("active");
  });
});

/* =========================================================
   API
   ========================================================= */

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
    throw new Error(
      data.detail || `HTTP ${response.status}`
    );
  }

  return data;
}

/* =========================================================
   BACKEND STATUS
   ========================================================= */

async function checkBackend() {
  const status =
    document.getElementById("backendStatus") ||
    document.getElementById("backend-status");

  if (!status) return;

  try {
    const data = await apiRequest("/api/health");

    status.textContent =
      data.status
        ? `Backend: ${data.status}`
        : "Backend: Online";

    status.classList.remove("offline");
    status.classList.add("online");

  } catch {

    status.textContent = "Backend: Offline";

    status.classList.remove("online");
    status.classList.add("offline");
  }
}

/* =========================================================
   VIRUS AI
   ========================================================= */

function createVirusAI() {
  const section = document.getElementById("codelab");

  if (!section) return;

  if (document.getElementById("virus-ai-container")) {
    return;
  }

  const wrapper = document.createElement("div");

  wrapper.id = "virus-ai-container";

  wrapper.innerHTML = `
    <div class="ov-ai-panel">

      <div class="ov-ai-header">

        <div>
          <div class="ov-ai-title">
            ☣ Virus AI
          </div>

          <div class="ov-ai-subtitle">
            Programming & Defensive Cybersecurity Assistant
          </div>
        </div>

        <div class="ov-ai-status">
          ● READY
        </div>

      </div>

      <div id="virus-ai-messages"
           class="ov-ai-messages">

        <div class="ov-ai-message ai">

          <strong>VIRUS AI</strong>

          <p>
            Hello! I'm Virus AI.
            I can help with programming,
            debugging, secure coding,
            networking and defensive cybersecurity.
          </p>

        </div>

      </div>

      <div class="ov-ai-tools">

        <button data-ai-prompt="Explain this code">
          Explain Code
        </button>

        <button data-ai-prompt="Help me fix this error">
          Fix Error
        </button>

        <button data-ai-prompt="Review this code for security issues">
          Security Review
        </button>

        <button data-ai-prompt="Teach me Python from the beginning">
          Learn Python
        </button>

      </div>

      <div class="ov-ai-input-row">

        <textarea
          id="virus-ai-input"
          placeholder="Ask Virus AI anything..."
        ></textarea>

        <button id="virus-ai-send">
          SEND
        </button>

      </div>

    </div>
  `;

  section.prepend(wrapper);

  document
    .querySelectorAll("[data-ai-prompt]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const input =
          document.getElementById("virus-ai-input");

        if (!input) return;

        input.value =
          button.dataset.aiPrompt;

        input.focus();
      });
    });

  const send =
    document.getElementById("virus-ai-send");

  if (send) {
    send.addEventListener(
      "click",
      sendVirusAI
    );
  }

  const input =
    document.getElementById("virus-ai-input");

  if (input) {

    input.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          sendVirusAI();
        }
      }
    );
  }
}

function addAIMessage(type, text) {

  const box =
    document.getElementById(
      "virus-ai-messages"
    );

  if (!box) return;

  const message =
    document.createElement("div");

  message.className =
    `ov-ai-message ${type}`;

  message.innerHTML = `
    <strong>
      ${type === "user" ? "YOU" : "VIRUS AI"}
    </strong>

    <p>
      ${escapeHTML(text).replace(
        /\n/g,
        "<br>"
      )}
    </p>
  `;

  box.appendChild(message);

  box.scrollTop =
    box.scrollHeight;
}

async function sendVirusAI() {

  const input =
    document.getElementById(
      "virus-ai-input"
    );

  const button =
    document.getElementById(
      "virus-ai-send"
    );

  if (!input) return;

  const message =
    input.value.trim();

  if (!message) return;

  addAIMessage(
    "user",
    message
  );

  input.value = "";

  if (button) {
    button.disabled = true;
    button.textContent = "THINKING...";
  }

  try {

    const result =
      await apiRequest(
        "/api/ai/chat",
        {
          method: "POST",

          body: JSON.stringify({
            message,

            context: {
              app: "One Virus",
              mode:
                "programming-cybersecurity"
            }
          })
        }
      );

    addAIMessage(
      "ai",
      result.reply ||
      result.message ||
      "No response received."
    );

  } catch {

    addAIMessage(
      "ai",
      localVirusAI(message)
    );
  }

  if (button) {

    button.disabled = false;
    button.textContent = "SEND";
  }
}

/* =========================================================
   LOCAL VIRUS AI FALLBACK
   ========================================================= */

function localVirusAI(message) {

  const text =
    message.toLowerCase();

  if (
    text.includes("python") ||
    text.includes("javascript") ||
    text.includes("typescript") ||
    text.includes("programming") ||
    text.includes("code")
  ) {

    return `
I can help you with programming,
debugging, code explanation and secure coding.

Supported languages include:

• Python
• JavaScript
• TypeScript
• C / C++
• Java
• Go
• Rust
• PHP
• Ruby
• Bash
• PowerShell

Paste your code and I can analyze it.
`;
  }

  if (
    text.includes("error") ||
    text.includes("bug") ||
    text.includes("debug")
  ) {

    return `
Let's debug the problem.

Send me:

1. Your code
2. The exact error message
3. The programming language

I will explain the cause
and suggest a fix.
`;
  }

  if (
    text.includes("security") ||
    text.includes("cyber") ||
    text.includes("secure")
  ) {

    return `
I can help with defensive cybersecurity:

• Secure Coding
• HTTP Security Headers
• DNS
• Network Concepts
• Hashing
• Authentication
• Log Analysis
• Vulnerability Awareness
• Security Code Review

Only test systems you own
or have explicit authorization to assess.
`;
  }

  return `
I'm Virus AI — your programming
and defensive cybersecurity assistant.

I can help with:

• Programming
• Debugging
• Code Review
• Secure Coding
• Python
• JavaScript
• Web Development
• Networking
• Defensive Cybersecurity
• Learning

What would you like to work on?
`;
}

/* =========================================================
   CODE RUNNER
   ========================================================= */

function createCodeRunner() {

  const section =
    document.getElementById("codelab");

  if (!section) return;

  if (
    document.getElementById(
      "virus-code-runner"
    )
  ) {
    return;
  }

  const runner =
    document.createElement("div");

  runner.id =
    "virus-code-runner";

  runner.innerHTML = `

    <div class="ov-runner">

      <div class="ov-runner-header">

        <div>
          <strong>
            Code Runner
          </strong>

          <span>
            Integrated Terminal
          </span>
        </div>

        <select id="ov-language">

          <option value="python">
            Python
          </option>

          <option value="javascript">
            JavaScript
          </option>

          <option value="typescript">
            TypeScript
          </option>

          <option value="bash">
            Bash
          </option>

          <option value="powershell">
            PowerShell
          </option>

          <option value="c">
            C
          </option>

          <option value="cpp">
            C++
          </option>

          <option value="java">
            Java
          </option>

          <option value="go">
            Go
          </option>

          <option value="rust">
            Rust
          </option>

          <option value="php">
            PHP
          </option>

          <option value="ruby">
            Ruby
          </option>

        </select>

      </div>


      <div class="ov-runner-body">


        <div class="ov-editor">

          <div class="ov-editor-title">

            <span>
              CODE
            </span>

            <div>

              <button id="ov-run">
                ▶ RUN
              </button>

              <button id="ov-clear">
                CLEAR
              </button>

              <button id="ov-ai-code">
                ☣ AI REVIEW
              </button>

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

            <span>
              $
            </span>

            <input
              id="ov-terminal-input"
              placeholder="Enter terminal command..."
            />

          </div>

        </div>

      </div>

    </div>
  `;

  section.appendChild(runner);

  document
    .getElementById("ov-run")
    ?.addEventListener(
      "click",
      runCode
    );

  document
    .getElementById("ov-clear")
    ?.addEventListener(
      "click",
      () => {

        const code =
          document.getElementById(
            "ov-code"
          );

        if (code) {
          code.value = "";
        }
      }
    );

  document
    .getElementById("ov-ai-code")
    ?.addEventListener(
      "click",
      () => {

        const code =
          document.getElementById(
            "ov-code"
          );

        const input =
          document.getElementById(
            "virus-ai-input"
          );

        if (!code || !input) return;

        input.value =
          "Review the following code for security issues:\n\n" +
          code.value;

        input.focus();

        document
          .getElementById(
            "virus-ai-container"
          )
          ?.scrollIntoView({
            behavior: "smooth"
          });
      }
    );

  document
    .getElementById(
      "ov-terminal-input"
    )
    ?.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {
          executeTerminalCommand();
        }
      }
    );
}

/* =========================================================
   RUN CODE
   ========================================================= */

async function runCode() {

  const code =
    document.getElementById(
      "ov-code"
    )?.value || "";

  const language =
    document.getElementById(
      "ov-language"
    )?.value || "python";

  const terminal =
    document.getElementById(
      "ov-terminal-output"
    );

  if (!terminal) return;

  if (!code.trim()) {

    terminal.textContent +=
      "\nNo code to run.\n$ ";

    return;
  }

  terminal.textContent +=
    `\n[RUNNING ${language.toUpperCase()}]\n`;

  try {

    const result =
      await apiRequest(
        "/api/code/run",
        {
          method: "POST",

          body: JSON.stringify({
            language,
            code
          })
        }
      );

    terminal.textContent +=
      (
        result.output ||
        result.stdout ||
        "Execution completed."
      ) +
      "\n$ ";

  } catch {

    terminal.textContent +=
      "\nCode execution backend is not connected yet." +
      "\nThe Code Runner interface is ready." +
      "\n$ ";
  }

  terminal.scrollTop =
    terminal.scrollHeight;
}

/* =========================================================
   TERMINAL
   ========================================================= */

async function executeTerminalCommand() {

  const input =
    document.getElementById(
      "ov-terminal-input"
    );

  const terminal =
    document.getElementById(
      "ov-terminal-output"
    );

  if (!input || !terminal) return;

  const command =
    input.value.trim();

  if (!command) return;

  terminal.textContent +=
    `\n$ ${command}`;

  input.value = "";

  try {

    const result =
      await apiRequest(
        "/api/terminal",
        {
          method: "POST",

          body: JSON.stringify({
            command
          })
        }
      );

    terminal.textContent +=
      "\n" +
      (
        result.output ||
        result.stdout ||
        "Command completed."
      ) +
      "\n";

  } catch {

    terminal.textContent +=
      "\nTerminal backend is not connected yet.\n";
  }

  terminal.textContent +=
    "$ ";

  terminal.scrollTop =
    terminal.scrollHeight;
}

/* =========================================================
   SECURITY TOOLKIT
   ========================================================= */

function createSecurityToolkit() {

  const section =
    document.getElementById(
      "tools"
    );

  if (!section) return;

  if (
    document.getElementById(
      "ov-toolkit"
    )
  ) {
    return;
  }

  const toolkit =
    document.createElement("div");

  toolkit.id =
    "ov-toolkit";

  toolkit.innerHTML = `

    <div class="ov-toolkit">

      <div class="ov-toolkit-header">

        <div>

          <h2>
            Security Toolkit
          </h2>

          <p>
            Defensive security utilities
          </p>

        </div>

      </div>


      <div class="ov-tools-grid">


        <div class="ov-tool-card">

          <h3>
            Base64 Encoder / Decoder
          </h3>

          <textarea
            id="tool-base64-input"
            placeholder="Enter text..."
          ></textarea>

          <div>

            <button id="base64-encode">
              ENCODE
            </button>

            <button id="base64-decode">
              DECODE
            </button>

          </div>

          <pre
            id="tool-base64-output"
          ></pre>

        </div>


        <div class="ov-tool-card">

          <h3>
            SHA-256 Hash Generator
          </h3>

          <textarea
            id="tool-hash-input"
            placeholder="Enter text..."
          ></textarea>

          <button id="hash-generate">
            GENERATE HASH
          </button>

          <pre
            id="tool-hash-output"
          ></pre>

        </div>


        <div class="ov-tool-card">

          <h3>
            JSON Formatter
          </h3>

          <textarea
            id="tool-json-input"
            placeholder='{"name":"One Virus"}'
          ></textarea>

          <button id="json-format">
            FORMAT JSON
          </button>

          <pre
            id="tool-json-output"
          ></pre>

        </div>


        <div class="ov-tool-card">

          <h3>
            URL Analyzer
          </h3>

          <input
            id="tool-url-input"
            placeholder="https://example.com"
          />

          <button id="url-analyze">
            ANALYZE URL
          </button>

          <pre
            id="tool-url-output"
          ></pre>

        </div>


        <div class="ov-tool-card">

          <h3>
            Regex Tester
          </h3>

          <input
            id="regex-pattern"
            placeholder="Regular expression"
          />

          <textarea
            id="regex-text"
            placeholder="Text to test..."
          ></textarea>

          <button id="regex-test">
            TEST REGEX
          </button>

          <pre
            id="regex-output"
          ></pre>

        </div>


        <div class="ov-tool-card">

          <h3>
            Secure Password Generator
          </h3>

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

          <pre
            id="password-output"
          ></pre>

        </div>


      </div>

    </div>
  `;

  section.appendChild(toolkit);

  document
    .getElementById(
      "base64-encode"
    )
    ?.addEventListener(
      "click",
      encodeBase64
    );

  document
    .getElementById(
      "base64-decode"
    )
    ?.addEventListener(
      "click",
      decodeBase64
    );

  document
    .getElementById(
      "hash-generate"
    )
    ?.addEventListener(
      "click",
      generateHash
    );

  document
    .getElementById(
      "json-format"
    )
    ?.addEventListener(
      "click",
      formatJSON
    );

  document
    .getElementById(
      "url-analyze"
    )
    ?.addEventListener(
      "click",
      analyzeURL
    );

  document
    .getElementById(
      "regex-test"
    )
    ?.addEventListener(
      "click",
      testRegex
    );

  document
    .getElementById(
      "password-generate"
    )
    ?.addEventListener(
      "click",
      generatePassword
    );
}

/* =========================================================
   BASE64
   ========================================================= */

function encodeBase64() {

  const input =
    document.getElementById(
      "tool-base64-input"
    );

  const output =
    document.getElementById(
      "tool-base64-output"
    );

  if (!input || !output) return;

  try {

    output.textContent =
      btoa(
        unescape(
          encodeURIComponent(
            input.value
          )
        )
      );

  } catch {

    output.textContent =
      "Unable to encode input.";
  }
}

function decodeBase64() {

  const input =
    document.getElementById(
      "tool-base64-input"
    );

  const output =
    document.getElementById(
      "tool-base64-output"
    );

  if (!input || !output) return;

  try {

    output.textContent =
      decodeURIComponent(
        escape(
          atob(input.value)
        )
      );

  } catch {

    output.textContent =
      "Invalid Base64 input.";
  }
}

/* =========================================================
   SHA256
   ========================================================= */

async function generateHash() {

  const input =
    document.getElementById(
      "tool-hash-input"
    );

  const output =
    document.getElementById(
      "tool-hash-output"
    );

  if (!input || !output) return;

  if (!input.value) {

    output.textContent =
      "Enter text first.";

    return;
  }

  const data =
    new TextEncoder().encode(
      input.value
    );

  const hash =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  const hex =
    [...new Uint8Array(hash)]
      .map(
        byte =>
          byte
            .toString(16)
            .padStart(2, "0")
      )
      .join("");

  output.textContent = hex;
}

/* =========================================================
   JSON
   ========================================================= */

function formatJSON() {

  const input =
    document.getElementById(
      "tool-json-input"
    );

  const output =
    document.getElementById(
      "tool-json-output"
    );

  if (!input || !output) return;

  try {

    const object =
      JSON.parse(input.value);

    output.textContent =
      JSON.stringify(
        object,
        null,
        2
      );

  } catch (error) {

    output.textContent =
      "Invalid JSON:\n" +
      error.message;
  }
}

/* =========================================================
   URL
   ========================================================= */

function analyzeURL() {

  const input =
    document.getElementById(
      "tool-url-input"
    );

  const output =
    document.getElementById(
      "tool-url-output"
    );

  if (!input || !output) return;

  try {

    const url =
      new URL(input.value);

    output.textContent =
`Protocol: ${url.protocol}
Hostname: ${url.hostname}
Port: ${url.port || "Default"}
Path: ${url.pathname}
Query: ${url.search || "None"}
Hash: ${url.hash || "None"}`;

  } catch {

    output.textContent =
      "Invalid URL.";
  }
}

/* =========================================================
   REGEX
   ========================================================= */

function testRegex() {

  const pattern =
    document.getElementById(
      "regex-pattern"
    );

  const text =
    document.getElementById(
      "regex-text"
    );

  const output =
    document.getElementById(
      "regex-output"
    );

  if (!pattern || !text || !output) {
    return;
  }

  try {

    const regex =
      new RegExp(
        pattern.value,
        "g"
      );

    const matches =
      text.value.match(regex);

    output.textContent =
      matches
        ? matches.join("\n")
        : "No matches found.";

  } catch (error) {

    output.textContent =
      "Invalid Regex:\n" +
      error.message;
  }
}

/* =========================================================
   PASSWORD GENERATOR
   ========================================================= */

function generatePassword() {

  const length =
    Number(
      document.getElementById(
        "password-length"
      )?.value
    ) || 20;

  const output =
    document.getElementById(
      "password-output"
    );

  if (!output) return;

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "abcdefghijklmnopqrstuvwxyz" +
    "0123456789" +
    "!@#$%^&*()_+-=";

  const array =
    new Uint32Array(length);

  crypto.getRandomValues(array);

  let password = "";

  for (
    let i = 0;
    i < length;
    i++
  ) {

    password +=
      chars[
        array[i] % chars.length
      ];
  }

  output.textContent =
    password;
}

/* =========================================================
   NETWORK TOOLS
   ========================================================= */

function setupNetworkTools() {

  const ipButton =
    document.getElementById(
      "ipAnalyzeBtn"
    );

  if (ipButton) {

    ipButton.addEventListener(
      "click",
      async () => {

        const target =
          document.getElementById(
            "ipTarget"
          )?.value.trim();

        const result =
          document.getElementById(
            "ipResult"
          );

        if (!result) return;

        if (!target) {

          result.textContent =
            "Enter an IP address or domain.";

          return;
        }

        result.textContent =
          "Analyzing...";

        try {

          const data =
            await apiRequest(
              "/api/network/ip",
              {
                method: "POST",

                body:
                  JSON.stringify({
                    target
                  })
              }
            );

          result.textContent =
            JSON.stringify(
              data,
              null,
              2
            );

        } catch (error) {

          result.textContent =
            "Network backend unavailable.\n" +
            error.message;
        }
      }
    );
  }

  const dnsButton =
    document.getElementById(
      "dnsLookupBtn"
    );

  if (dnsButton) {

    dnsButton.addEventListener(
      "click",
      async () => {

        const target =
          document.getElementById(
            "dnsTarget"
          )?.value.trim();

        const result =
          document.getElementById(
            "dnsResult"
          );

        if (!result || !target) return;

        result.textContent =
          "Looking up DNS...";

        try {

          const data =
            await apiRequest(
              "/api/network/dns",
              {
                method: "POST",

                body:
                  JSON.stringify({
                    target
                  })
              }
            );

          result.textContent =
            JSON.stringify(
              data,
              null,
              2
            );

        } catch (error) {

          result.textContent =
            "DNS backend unavailable.\n" +
            error.message;
        }
      }
    );
  }

  const headersButton =
    document.getElementById(
      "headersInspectBtn"
    );

  if (headersButton) {

    headersButton.addEventListener(
      "click",
      async () => {

        const target =
          document.getElementById(
            "headersTarget"
          )?.value.trim();

        const result =
          document.getElementById(
            "headersResult"
          );

        if (!result || !target) return;

        result.textContent =
          "Inspecting HTTP headers...";

        try {

          const data =
            await apiRequest(
              "/api/network/headers",
              {
                method: "POST",

                body:
                  JSON.stringify({
                    target
                  })
              }
            );

          result.textContent =
            JSON.stringify(
              data,
              null,
              2
            );

        } catch (error) {

          result.textContent =
            "Headers backend unavailable.\n" +
            error.message;
        }
      }
    );
  }
}

/* =========================================================
   DEFENSE TOOLS
   ========================================================= */

function setupDefenseTools() {

  const hashButton =
    document.getElementById(
      "hashAnalyzeBtn"
    );

  if (hashButton) {

    hashButton.addEventListener(
      "click",
      async () => {

        const value =
          document.getElementById(
            "hashInput"
          )?.value.trim();

        const result =
          document.getElementById(
            "hashResult"
          );

        if (!result || !value) return;

        result.textContent =
          "Analyzing hash format...";

        try {

          const data =
            await apiRequest(
              "/api/defense/hash",
              {
                method: "POST",

                body:
                  JSON.stringify({
                    value
                  })
              }
            );

          result.textContent =
            JSON.stringify(
              data,
              null,
              2
            );

        } catch (error) {

          result.textContent =
            "Defense backend unavailable.\n" +
            error.message;
        }
      }
    );
  }

  const logsButton =
    document.getElementById(
      "logsAnalyzeBtn"
    );

  if (logsButton) {

    logsButton.addEventListener(
      "click",
      async () => {

        const value =
          document.getElementById(
            "logsInput"
          )?.value;

        const result =
          document.getElementById(
            "logsResult"
          );

        if (!result || !value) return;

        result.textContent =
          "Analyzing logs...";

        try {

          const data =
            await apiRequest(
              "/api/defense/logs",
              {
                method: "POST",

                body:
                  JSON.stringify({
                    text: value
                  })
              }
            );

          result.textContent =
            JSON.stringify(
              data,
              null,
              2
            );

        } catch (error) {

          result.textContent =
            "Log analysis backend unavailable.\n" +
            error.message;
        }
      }
    );
  }
}

/* =========================================================
   SECURITY
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function setupMobileSidebar() {

  const sidebar =
    document.querySelector(
      ".sidebar"
    );

  if (!sidebar) return;

  let startX = 0;

  document.addEventListener(
    "touchstart",
    event => {

      startX =
        event.touches[0].clientX;
    }
  );

  document.addEventListener(
    "touchend",
    event => {

      const endX =
        event.changedTouches[0].clientX;

      const distance =
        endX - startX;

      if (
        Math.abs(distance) < 70
      ) {
        return;
      }

      if (
        distance > 0 &&
        startX < 80
      ) {

        sidebar.classList.add(
          "open"
        );
      }

      if (distance < 0) {

        sidebar.classList.remove(
          "open"
        );
      }
    }
  );
}

/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

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

    } else {

      showSection("dashboard");
    }

    console.log(
      "%c☣ ONE VIRUS",
      "color:#00ff9c;font-size:22px;font-weight:900"
    );

    console.log(
      "%cVirus AI initialized",
      "color:#00d9ff"
    );
  }
);
