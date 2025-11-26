// -----------------------------
// ProfileFunctional: user profile helpers and UI handlers
// Sections: fetch, edit, avatar upload, delete, logout, UI
// -----------------------------
// Token and DOM elements used across profile operations
const token = localStorage.getItem("token");

const accEl = document.getElementById("ACC");
const passEl = document.getElementById("PASS");
const mailEl = document.getElementById("MAIL");
const avatarEl = document.getElementById("AVATAR");

// -----------------------------
// Fetch profile data and populate UI
// -----------------------------
async function profileFetch() {
  try {
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users/token",
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );

    if (!response.ok) {
      if (response.status === 401)
        throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    console.log("Profile data fetched:", data);

    const avatarHolder = document.getElementById("avatarHolder");
    const nameHolder = document.getElementById("nameHolder");
    const mailHolder = document.getElementById("mailHolder");

    avatarURL =
      "https://media2.edu.metropolia.fi/restaurant/uploads/" + data.avatar;

    avatarHolder.src = avatarURL || "./Photos/avatar.png";
    nameHolder.textContent = data.username || "N/A";
    mailHolder.textContent = data.email || "N/A";
    accEl.value = data.username || "";
    passEl.value = "";
    mailEl.value = data.email || "";
  } catch (err) {
    console.error(err);
  }
}

// -----------------------------
// Edit profile data (username, password, email)
// -----------------------------
async function profileEdit() {
  if (!token) return (window.location.href = "./index.html");

  const body = {};
  if (accEl && accEl.value.trim()) body.username = accEl.value.trim();
  if (passEl && passEl.value.trim()) body.password = passEl.value.trim();
  if (mailEl && mailEl.value.trim()) body.email = mailEl.value.trim();

  try {
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      if (response.status === 401)
        return (window.location.href = "./index.html");
      throw new Error(`HTTP error: ${response.status}`);
    }

    localStorage.setItem("username", body.username);

    await profileFetch();
    alert("Profiilin päivitys onnistui");
    closeModal();
  } catch (err) {
    console.error(err);
    window.location.href = "./index.html";
  }
}

// -----------------------------
// Avatar upload handling
// -----------------------------
// Update preview and upload on file change
avatarEl.addEventListener("change", (e) => {
  const file = e.target.files[0];
  avatarHolder.src = URL.createObjectURL(file);
  profileAvatarEdit(file);
});

// Upload avatar to server using FormData
async function profileAvatarEdit(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users/avatar",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Profiilikuvan päivitys epäonnistui");
    }

    const data = await response.json();
    console.log(data);

    closeModal();
    alert("Profiilikuvan päivitys onnistui");
  } catch (err) {
    console.error(err);
  }
}

// -----------------------------
// Account deletion
// -----------------------------
async function deleteProfile() {
  try {
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users",
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    alert("Tilin poisto onnistui");
    logOut();
  } catch (err) {
    console.error(err);
  }
}

async function updateProfile() {}

// -----------------------------
// Log out helper
// -----------------------------
function logOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "./index.html";
}

// -----------------------------
// TopBar (shared UI)
// -----------------------------
// Burger dropdown
var brgr = document.getElementById("myLinks");

function openBurger() {
  if (brgr.style.display === "block") {
    brgr.style.display = "none";
  } else {
    brgr.style.display = "block";
  }
}

// -----------------------------
// Edit modal (profile page)
// -----------------------------
const editModal = document.getElementById("Modal");
const loginBtn = document.getElementById("loginBtn");

function openModal() {
  editModal.style.display = "flex";
  document.documentElement.classList.add("modal-open");
}

function closeModal() {
  editModal.style.display = "none";
  document.documentElement.classList.remove("modal-open");
}

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target == editModal) {
    closeModal();
  }
};

// -----------------------------
// Initialize profile on DOMContentLoaded
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  profileFetch();
});
