// -- Registration and Login Functions -- //
// Registration
async function registerFunction() {
  const accEl = document.getElementById("ACCReg");
  const passEl = document.getElementById("PASSReg");
  const mailEl = document.getElementById("MAILReg");

  const username = accEl.value.trim();
  const password = passEl.value.trim();
  const email = mailEl.value.trim();

  if (!username || !password || !email) {
    alert("Täytä kaikki kentät");
    return;
  }

  try {
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Rekisteröinti onnistui");
      closeModal();
      openModal();
    } else {
      alert(data.message || "Rekisteröinti epäonnistui");
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
}

// Login
async function loginFunction() {
  const accEl = document.getElementById("ACC");
  const passEl = document.getElementById("PASS");
  const username = accEl?.value?.trim();
  const password = passEl?.value?.trim();

  if (!username || !password) {
    alert("Täytä kaikki kentät");
    return;
  }

  try {
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();

    console.log(data.token);

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", username);

    alert("Kirjautuminen onnistui");
    logged();
  } catch (err) {
    console.error(err);
    alert("Kirjautuminen epäonnistui");
  }
}

// -- Login state -- //
// Modal
const loginModal2 = document.getElementById("Modal");
const registerModal2 = document.getElementById("registerModal");
const loginBtn2 = document.getElementById("loginBtn");

function logged() {
  // Login button
  loginBtn2.textContent = localStorage.getItem("username");
  loginBtn2.onclick = null;
  loginBtn2.href = "./profiili.html";

  // Close modal
  loginModal2.style.display = "none";
  registerModal2.style.display = "none";
  document.documentElement.classList.remove("modal-open");
  location.reload();
}

document.getElementById("loginSubmit").addEventListener("submit", function (e) {
  e.preventDefault();
  loginFunction();
});

document
  .getElementById("registerSubmit")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    registerFunction();
  });
