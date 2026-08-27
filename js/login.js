import { loginUser, onlyDigits, setupSelect } from "./auth.js";

const form = document.getElementById("login-form");
const errorEl = document.getElementById("form-error");
const docNumber = document.getElementById("docNumber");
const password = document.getElementById("password");

setupSelect();
onlyDigits(docNumber);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorEl.hidden = true;

  const payload = {
    docType: document.getElementById("docType").value,
    docNumber: docNumber.value.trim(),
    password: password.value.trim(),
  };

  if (!payload.docNumber || !payload.password) {
    errorEl.textContent = "Completa tu documento y contraseña para ingresar.";
    errorEl.hidden = false;
    return;
  }

  try {
    loginUser(payload);
    window.location.href = "./pages/dashboard.html";
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  }
});
