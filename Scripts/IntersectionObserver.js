// -----------------------------
// IntersectionObserver: toggle destination button text/target
// -----------------------------
const mapSection = document.querySelector("#m");
const destinationButton = document.querySelector("#dest-Btn");

// Observe when the map section crosses the viewport threshold
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        destinationButton.textContent = "⬆ Siirry ylös ⬆";
        destinationButton.parentElement.href = "#h";
      } else {
        destinationButton.textContent = "⬇ Siirry alas ⬇";
        destinationButton.parentElement.href = "#m";
      }
    });
  },
  { threshold: 0.5 }
);

observer.observe(mapSection);
