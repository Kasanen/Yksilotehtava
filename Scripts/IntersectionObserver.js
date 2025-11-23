// -----------------------------
// IntersectionObserver: toggle destination button text/target
// -----------------------------
const mapSection = document.querySelector("#m");
const destinationButton = document.getElementById("dest-Btn");

// Observe when the map section crosses the viewport threshold
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        destinationButton.textContent = "⬆ Siirry ylös ⬆";
        destinationButton.href = "#h";
      } else {
        destinationButton.textContent = "⬇ Siirry alas ⬇";
        destinationButton.href = "#m";
      }
    });
  },
  { threshold: 0.5 }
);

observer.observe(mapSection);
