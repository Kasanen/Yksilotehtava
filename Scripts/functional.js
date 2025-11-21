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
var loginModal = document.getElementById("Modal");
var registerModal = document.getElementById("registerModal");
var loginBtn = document.getElementById("loginBtn");

function openModal() {
  loginModal.style.display = "flex";
  document.documentElement.classList.add("modal-open");
}

function openRegisterModal() {
  registerModal.style.display = "flex";
  document.documentElement.classList.add("modal-open");
}

function closeModal() {
  loginModal.style.display = "none";
  registerModal.style.display = "none";
  document.documentElement.classList.remove("modal-open");
}

/* -- Window -- */
window.onclick = function (event) {
  if (event.target == loginModal || event.target == registerModal) {
    closeModal();
  }
};

// -- On page load -- //
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (token && username) {
    loginBtn.textContent = username;
    loginBtn.onclick = null;
    loginBtn.href = "./profiili.html";
  }
});
