// -----------------------------
// Favorite restaurant helpers
// -----------------------------
// Token read from localStorage (used to mark favorites)
const token = localStorage.getItem("token");

// Check favorite checkbox state and trigger API update
function checkFavorite(restaurantId) {
  const favoriteCheckbox = document.getElementById("favorite");

  if (!token) return closeModal(), openModal();

  if (favoriteCheckbox.checked) {
    markFavorite(restaurantId);
    favoriteCheckbox.disabled = true;
  }
}

// Send favorite update to API (requires auth)
async function markFavorite(id) {
  const body = {};
  body.favouriteRestaurant = id;

  console.log("Marking favorite with body:", body);

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
    const data = await response.json();
    console.log("Favorite marked:", data);
  } catch (err) {
    console.error("Error marking favorite:", err);
  }
}
