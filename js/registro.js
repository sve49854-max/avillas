import { onlyDigits, registerUser, setupSelect } from "./auth.js";

const form = document.getElementById("register-form");
const errorEl = document.getElementById("form-error");
const successEl = document.getElementById("success-note");

setupSelect();
onlyDigits(document.getElementById("docNumber"));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorEl.hidden = true;
  successEl.classList.remove("show");

  const name = document.getElementById("name").value.trim();
  const docType = document.getElementById("docType").value;
  const docNumber = document.getElementById("docNumber").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm").value.trim();

  if (!name || !docNumber || !password || !confirm) {
    errorEl.textContent = "Completa todos los campos para registrarte.";
    errorEl.hidden = false;
    return;
  }

  if (password.length < 4) {
    errorEl.textContent = "La contraseña debe tener al menos 4 caracteres.";
    errorEl.hidden = false;
    return;
  }

  if (password !== confirm) {
    errorEl.textContent = "Las contraseñas no coinciden.";
    errorEl.hidden = false;
    return;
  }

  try {
    registerUser({ docType, docNumber, password, name });
    successEl.textContent = "Tu registro quedó listo. Ya puedes ingresar a Co-banking.";
    successEl.classList.add("show");
    form.reset();
    const display = document.querySelector(".select-display");
    if (display) display.value = "";
    document.getElementById("docType").value = "CC";
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 900);
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  }
});
