import { logout, requireSession } from "./auth.js";

const session = requireSession();
const firstName = (session.name || "Cliente").split(" ")[0];

document.getElementById("user-name").textContent = session.name;
document.getElementById("hello-title").textContent = `Hola, ${firstName}`;
document.getElementById("user-avatar").textContent = firstName.charAt(0).toUpperCase();

document.getElementById("logout").addEventListener("click", () => {
  logout();
  window.location.href = "../login.html";
});

const toast = document.getElementById("toast");
let toastTimer;

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => {
    toast.textContent = button.dataset.toast;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  });
});
