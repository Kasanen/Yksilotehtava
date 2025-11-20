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

  console.log(username, password, email);

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

    if (response.ok && data.status === "success") {
      console.log(data);
      console.log(data.token);
      localStorage.setItem("authToken", data.token);
      alert("Rekisteröinti onnistui");
    } else {
      alert(data.message || "Rekisteröinti epäonnistui");
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
}

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

    localStorage.setItem("authToken", data.token);
    alert("Kirjautuminen onnistui");
    console.log("Ennen logged");
    logged(username);
  } catch (err) {
    console.error(err);
    alert("Kirjautuminen epäonnistui");
  }
}

// -- Modal -- //
const loginModal = document.getElementById("Modal");
const registerModal = document.getElementById("registerModal");
const loginBtn = document.getElementById("loginBtn");

function logged(username) {
  console.log("Logged");

  // Login button
  loginBtn.textContent = username;
  loginBtn.onclick = null;
  loginBtn.href = "./profiili.html";

  // Close modal
  loginModal.style.display = "none";
  registerModal.style.display = "none";
  document.documentElement.classList.remove("modal-open");
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
