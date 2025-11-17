/* -- TopBar -- */
// Burger dropdown
var brgr = document.getElementById('myLinks');

function openBurger() {
  if (brgr.style.display === 'block') {
    brgr.style.display = 'none';
  } else {
    brgr.style.display = 'block';
  }
}

/* -- Scroll button -- */
const mapSection = document.querySelector('#m');
const destinationButton = document.querySelector('#dest-Btn');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        destinationButton.textContent = '⬆ Siirry ylös ⬆';
        destinationButton.parentElement.href = '#h';
      } else {
        destinationButton.textContent = '⬇ Siirry alas ⬇';
        destinationButton.parentElement.href = '#m';
      }
    });
  },
  {threshold: 0.5}
);

observer.observe(mapSection);

/* -- Modal -- */
var loginModal = document.getElementById('Modal');
var loginBtn = document.getElementById('loginBtn');

function openModal() {
  loginModal.style.display = 'block';
  document.documentElement.classList.add('modal-open');
}

function closeModal() {
  loginModal.style.display = 'none';
  document.documentElement.classList.remove('modal-open');
}

// Modal Functions
var accModal = document.getElementById('ACC');
var passModal = document.getElementById('PASS');

function checkAccount() {
  const val = accModal.value.trim();
  console.log(val);
}

/* -- Window -- */
window.onclick = function (event) {
  if (event.target == loginModal) {
    closeModal();
  }
};
