const STORAGE_USERS = "avvillas.users";
const STORAGE_SESSION = "avvillas.session";

const DOC_LABELS = {
  CC: "Cédula de Ciudadanía",
  CE: "Cédula de Extranjería",
  NIT: "NIT",
  PA: "Pasaporte",
  TI: "Tarjeta de Identidad",
  PEP: "PEP",
};

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function seedDemoUser() {
  const users = readUsers();
  const exists = users.some((user) => user.docNumber === "12345678");
  if (!exists) {
    users.push({
      docType: "CC",
      docNumber: "12345678",
      password: "1234",
      name: "Camila Restrepo",
      createdAt: Date.now(),
    });
    writeUsers(users);
  }
}

function findUser(docType, docNumber) {
  return readUsers().find(
    (user) => user.docType === docType && user.docNumber === docNumber
  );
}

function registerUser({ docType, docNumber, password, name }) {
  const users = readUsers();
  if (users.some((user) => user.docType === docType && user.docNumber === docNumber)) {
    throw new Error("Este documento ya tiene una contraseña registrada.");
  }
  users.push({
    docType,
    docNumber,
    password,
    name: name || "Cliente AV Villas",
    createdAt: Date.now(),
  });
  writeUsers(users);
}

function loginUser({ docType, docNumber, password }) {
  seedDemoUser();
  const user = findUser(docType, docNumber);

  if (user) {
    if (user.password !== password) {
      throw new Error("La contraseña no es válida. Inténtalo de nuevo.");
    }
    saveSession(user);
    return user;
  }

  if (docNumber.length >= 6 && password.length >= 4) {
    const guest = {
      docType,
      docNumber,
      name: "Cliente AV Villas",
      guest: true,
    };
    saveSession(guest);
    return guest;
  }

  throw new Error("Revisa tu documento y contraseña para continuar.");
}

function saveSession(user) {
  localStorage.setItem(
    STORAGE_SESSION,
    JSON.stringify({
      docType: user.docType,
      docNumber: user.docNumber,
      name: user.name,
      guest: Boolean(user.guest),
    })
  );
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SESSION) || "null");
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem(STORAGE_SESSION);
}

function requireSession() {
  const session = getSession();
  if (!session) {
    window.location.href = new URL("../index.html", window.location.href).href;
  }
  return session;
}

function resetPassword({ docType, docNumber, password }) {
  const users = readUsers();
  const index = users.findIndex(
    (user) => user.docType === docType && user.docNumber === docNumber
  );
  if (index === -1) {
    throw new Error("No encontramos una cuenta con ese documento.");
  }
  users[index].password = password;
  writeUsers(users);
}

function setupSelect(root = document) {
  const wrap = root.querySelector(".field-select");
  if (!wrap) return;

  const trigger = wrap.querySelector(".select-trigger") || wrap.querySelector("label");
  const menu = wrap.querySelector(".select-menu");
  const valueEl = wrap.querySelector(".value");
  const visibleInput = wrap.querySelector(".select-display");
  const hidden = wrap.querySelector("input[type='hidden']");

  const close = () => {
    menu.hidden = true;
    wrap.classList.remove("open", "is_open");
    if (trigger && trigger.setAttribute) {
      trigger.setAttribute("aria-expanded", "false");
    }
  };

  const toggle = (event) => {
    event.preventDefault();
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    wrap.classList.toggle("open", willOpen);
    wrap.classList.toggle("is_open", willOpen);
    if (trigger && trigger.setAttribute) {
      trigger.setAttribute("aria-expanded", String(willOpen));
    }
  };

  trigger.addEventListener("click", toggle);

  menu.querySelectorAll("[role='option']").forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      menu.querySelectorAll("[role='option']").forEach((item) => {
        item.setAttribute("aria-selected", "false");
      });
      option.setAttribute("aria-selected", "true");
      const label = option.textContent.trim();
      if (valueEl) valueEl.textContent = label;
      if (visibleInput) visibleInput.value = label;
      hidden.value = option.dataset.value;
      close();
      wrap.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  document.addEventListener("click", (event) => {
    if (!wrap.contains(event.target)) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function onlyDigits(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D+/g, "");
  });
}

seedDemoUser();

export {
  DOC_LABELS,
  findUser,
  getSession,
  loginUser,
  logout,
  onlyDigits,
  registerUser,
  requireSession,
  resetPassword,
  setupSelect,
};
