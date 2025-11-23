// -- User calls -- //
const token = localStorage.getItem("token");

const accEl = document.getElementById("ACC");
const passEl = document.getElementById("PASS");
const mailEl = document.getElementById("MAIL");
const avatarEl = document.getElementById("AVATAR");

// Fetch profile data
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

// Edit profile data
async function profileEdit() {
  if (!token) return (window.location.href = "/index.html");

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
        return (window.location.href = "/index.html");
      throw new Error(`HTTP error: ${response.status}`);
    }

    localStorage.setItem("username", body.username);

    await profileFetch();
    alert("Profiilin päivitys onnistui");
    closeModal();
  } catch (err) {
    console.error(err);
    window.location.href = "/index.html";
  }
}

// Upload avatar listener
avatarEl.addEventListener("change", (e) => {
  const file = e.target.files[0];
  avatarHolder.src = URL.createObjectURL(file);
  profileAvatarEdit(file);
});

// Upload avatar function
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

// Delete account function
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

// -- Log out function -- //
function logOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "/index.html";
}

/* -- TopBar -- */
// Burger dropdown
var brgr = document.getElementById("myLinks");

function openBurger() {
  if (brgr.style.display === "block") {
    brgr.style.display = "none";
  } else {
    brgr.style.display = "block";
  }
}

/* -- Modal -- */
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

/* -- Window -- */
window.onclick = function (event) {
  if (event.target == editModal) {
    closeModal();
  }
};

// -- On page load -- //
document.addEventListener("DOMContentLoaded", () => {
  profileFetch();
});
