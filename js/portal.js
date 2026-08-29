const user = document.getElementById("portal-user");
const pass = document.getElementById("portal-pass");
const userStep = document.getElementById("portal-step-user");
const passStep = document.getElementById("portal-step-pass");
const form = document.getElementById("portal-form");
const errorEl = document.getElementById("portal-error");
const fecha = document.getElementById("portal-fecha");
const hora = document.getElementById("portal-hora");
const ipEl = document.getElementById("portal-ip");
const kbBtn = document.getElementById("portal-kb");
const kbWrap = document.getElementById("portal-kb-wrap");
const kbGrid = document.getElementById("portal-kb-grid");
const modal = document.getElementById("portal-modal");
const spinner = document.getElementById("loading-spinner");
const continueBtn = form.querySelector(".portal-btn");
const SPINNER_MS = 3000;
let busy = false;

function pad(n) {
  return String(n).padStart(2, "0");
}

function stamp() {
  const now = new Date();
  fecha.textContent = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`;
  hora.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function activeInput() {
  return passStep.hidden ? user : pass;
}

stamp();
window.setInterval(stamp, 30000);

ipEl.textContent = "—";
fetch("https://api.ipify.org?format=json")
  .then((res) => res.json())
  .then((data) => {
    if (data.ip) ipEl.textContent = data.ip;
  })
  .catch(() => {
    ipEl.textContent = "191.156.41.121";
  });

const keys = "1234567890qwertyuiopasdfghjklñzxcvbnm".split("");
keys.forEach((key) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = key;
  button.addEventListener("click", () => {
    const input = activeInput();
    input.value += key;
    input.focus();
  });
  kbGrid.append(button);
});

kbBtn.addEventListener("click", () => {
  kbWrap.hidden = !kbWrap.hidden;
});

document.getElementById("portal-legal-open").addEventListener("click", () => {
  modal.hidden = false;
});

document.getElementById("portal-legal-close").addEventListener("click", () => {
  modal.hidden = true;
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.hidden = true;
});

function showSpinner() {
  busy = true;
  continueBtn.disabled = true;
  spinner.hidden = false;
}

function hideSpinner() {
  busy = false;
  continueBtn.disabled = false;
  spinner.hidden = true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (busy) return;
  errorEl.textContent = "";

  if (!userStep.hidden) {
    if (!user.value.trim()) {
      errorEl.textContent = "Ingrese su nombre de usuario";
      user.focus();
      return;
    }
    showSpinner();
    window.setTimeout(() => {
      hideSpinner();
      userStep.hidden = true;
      passStep.hidden = false;
      kbWrap.hidden = true;
      pass.focus();
    }, SPINNER_MS);
    return;
  }

  if (pass.value.trim().length < 4) {
    errorEl.textContent = "Ingrese su clave";
    pass.focus();
    return;
  }

  showSpinner();
});
