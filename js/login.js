import { onlyDigits, setupSelect } from "./auth.js";

const form = document.getElementById("login-form");
const errorEl = document.getElementById("form-error");
const docNumber = document.getElementById("docNumber");
const password = document.getElementById("password");
const submitBtn = document.getElementById("login-btn-ingresar");
const spinner = document.getElementById("loading-spinner");

setupSelect();
onlyDigits(docNumber);

function syncSubmit() {
  submitBtn.disabled = password.value.trim().length < 4;
}

docNumber.addEventListener("input", syncSubmit);
password.addEventListener("input", syncSubmit);
syncSubmit();

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
});
