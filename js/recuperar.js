import { onlyDigits, resetPassword, setupSelect } from "./auth.js";

const form = document.getElementById("recover-form");
const errorEl = document.getElementById("form-error");
const successEl = document.getElementById("success-note");

setupSelect();
onlyDigits(document.getElementById("docNumber"));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorEl.hidden = true;
  successEl.classList.remove("show");

  const docType = document.getElementById("docType").value;
  const docNumber = document.getElementById("docNumber").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!docNumber || !password) {
    errorEl.textContent = "Ingresa tu documento y una nueva contraseña.";
    errorEl.hidden = false;
    return;
  }

  try {
    resetPassword({ docType, docNumber, password });
    successEl.textContent = "Contraseña actualizada. Te llevamos al ingreso.";
    successEl.classList.add("show");
    setTimeout(() => {
      window.location.href = "../login.html";
    }, 900);
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  }
});
