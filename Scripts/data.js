const url = "https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants";

/* -- Base -- */
async function getMenu(requestURL) {
  try {
    const response = await fetch(requestURL, {
      headers: {
        "x-api-key": "reqres-free-v1",
      },
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error:", err);
  }
}

async function fetchDailyMenu(id) {
  const data = await getMenu(
    `https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/daily/${id}/fi`
  );
  console.log("Daily menu data:", data);

  const courses = data.courses;
  return courses.map((c) => ({
    name: c.name,
    price: c.price,
    diets: c.diets,
  }));
}

async function fetchWeeklyMenu(id) {
  const data = await getMenu(
    `https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/weekly/${id}/fi`
  );

  return (data.days || []).map((day) => ({
    date: day.date,
    courses: (day.courses || []).map((c) => ({
      name: c.name,
      price: c.price,
      diets: c.diets,
    })),
  }));
}

// User location
function getUserLocation(callback) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
    },
    (error) => {
      console.error(error);
    }
  );
}

// Promise wrapper for geolocation
function getUserLocationPromise() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation not supported"));
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err)
    );
  });
}

// Calculating distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* -- Fetch restaurants show -- */
async function fetchRestaurants(filterNumb) {
  const data = await getMenu(url);

  const restaurants = data.map((r) => ({
    _id: r._id,
    address: r.address,
    city: r.city,
    company: r.company,
    name: r.name,
    phone: r.phone,
    postalCode: r.postalCode,
    location: r.location,
  }));

  // Skip switch
  if (filterNumb === 3) {
    return await sortByFav(restaurants);
  }

  switch (filterNumb) {
    case 1:
      await sortByName(restaurants);
      break;
    case 2:
      await sortByLoc(restaurants);
      break;
    default:
      console.log("Filter staying on " + filterNumb);
  }
  return restaurants;
}

// Sorting by name
function sortByName(list) {
  list.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
}

// Sorting by location
async function sortByLoc(list) {
  try {
    const loc = await getUserLocationPromise();
    const userLat = loc.lat;
    const userLon = loc.lon;

    list.sort((a, b) => {
      const aLat = a.location.coordinates[1];
      const aLon = a.location.coordinates[0];
      const bLat = b.location.coordinates[1];
      const bLon = b.location.coordinates[0];

      const distA = getDistance(userLat, userLon, aLat, aLon);
      const distB = getDistance(userLat, userLon, bLat, bLon);
      return distA - distB;
    });
  } catch (err) {
    console.error(
      "Could not get user location, falling back to name sort:",
      err
    );
    sortByName(list);
  }
}

// Sorting by favorites
async function sortByFav(list) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Kirjaudu sisään nähdäksesi suosikkiravintolat");
    sortByName(list);
    return;
  }

  try {
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users/token",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch favorites");
    }
    const data = await response.json();
    const favoriteId = data.favouriteRestaurant;
    if (!favoriteId) return [];

    return list.filter((r) => r._id === favoriteId);
  } catch (err) {
    console.error(err);
    sortByName(list);
  }
}

/* -- Main menu restaurant data -- */
async function main(filterNumb) {
  // Setting global filter
  window.currentRestaurantFilter =
    typeof filterNumb === "number" ? filterNumb : 0;
  const restaurants = await fetchRestaurants(filterNumb);

  // Printing out
  const table = document.querySelector("table");
  table.innerHTML = "";
  table.insertAdjacentHTML(
    "beforeend",
    `
              <tr id="table-top">
                <th>Nimi</th>
                <th>Osoite</th>
              </tr>
        `
  );

  let trId = 0;

  restaurants.map((restaurant) => {
    trId++;
    table.insertAdjacentHTML(
      "beforeend",
      `
            <tr id="${trId}" onclick="showRestaurantModal(this.id)" style="cursor: pointer">
                <td>${restaurant.name}</td>
                <td>${restaurant.address}</td>
            </tr>
        `
    );
  });

  // Nearest restaurant highlight
  const nearestRestaurant = await fetchRestaurants(2);
  for (let i = 1; i < restaurants.length; i++) {
    document.getElementById(i).classList.remove("nearest");
  }
  const nearestId =
    nearestRestaurant.length > 0
      ? restaurants.findIndex((r) => r._id === nearestRestaurant[0]._id) + 1
      : -1;
  if (nearestId !== -1) {
    document.getElementById(nearestId).classList.add("nearest");
  }
}

// Restaurant menu modal
async function showRestaurantModal(id) {
  const filterNumb = window.currentRestaurantFilter ?? 0;
  const restaurants = await fetchRestaurants(filterNumb);

  const dailyMenu = await fetchDailyMenu(restaurants[id - 1]._id);
  const dailyMenuHTML = dailyMenu.length
    ? `${dailyMenu
        .map(
          (c) => `<li>
          <h4>${c.name}</h4>
          <p>Hinta: ${c.price} </p>
          <p>Dieetit: ${c.diets.join(", ")}</p>
          </li>`
        )
        .join("")}`
    : "<p>Päivän menu ei saatavilla</p>";

  const weeklyMenu = await fetchWeeklyMenu(restaurants[id - 1]._id);
  const weeklyMenuHTML = weeklyMenu.length
    ? `${weeklyMenu
        .map(
          (day) =>
            `<h3><strong>${day.date}</strong></h3>${day.courses
              .map(
                (c) => `<li>
                <h4>${c.name}</h4>
                <p>Hinta: ${c.price} </p>
                <p>Dieetit: ${c.diets.join(", ")}</p>
                </li>`
              )
              .join("")}`
        )
        .join("")}`
    : "<p>Viikon menu ei saatavilla</p>";
  const modalText = document.getElementById("modalText");

  // Highlight text color
  for (let i = 1; i < restaurants.length; i++) {
    document.getElementById(i).classList.remove("highlight");
  }
  document.getElementById(id).classList.add("highlight");

  modalText.innerHTML = "";
  // Filtered selection
  const savedType = localStorage.getItem("menuType");
  switch (savedType) {
    case "daily":
      modalText.insertAdjacentHTML(
        "beforeend",
        `
          <span class="closeModal" onclick="closeModal()">&times;</span>
            <ul>
                <h3> ${restaurants[id - 1].name} </h3>
                <h3> Päivän Menu </h3>
                ${dailyMenuHTML}
                <h3>Suosikki:
                  <input type="checkbox" id="favorite" onclick="checkFavorite('${
                    restaurants[id - 1]._id
                  }')">
                </h3>
            </ul>
        `
      );
      break;
    case "weekly":
      modalText.insertAdjacentHTML(
        "beforeend",
        `
          <span class="closeModal" onclick="closeModal()">&times;</span>
            <ul>
                <h3> ${restaurants[id - 1].name} </h3>
                <h3> Viikon Menu </h3>
                ${weeklyMenuHTML}
                <h3>Suosikki:
                <input type="checkbox" id="favorite" onclick="checkFavorite('${
                  restaurants[id - 1]._id
                }')">
                </h3>
            </ul>
        `
      );
      break;
    default:
      console.log("Error in filtering");
  }

  modalText.parentElement.style.display = "flex";
  document.documentElement.classList.add("modal-open");
}

// Weekly / Daily selector
document.querySelectorAll(".menuType").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const type = this.dataset.type;

    // Save for later
    localStorage.setItem("menuType", type);

    console.log("User selected:", type);
  });
});

/* -- MAP -- */
async function mapOutput() {
  const restaurants = await fetchRestaurants(1);

  getUserLocation((loc) => {
    const userLat = loc.lat;
    const userLon = loc.lon;

    var map = L.map("map").setView([userLat, userLon], 12);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const redDivIcon = L.divIcon({
      className: "user-marker",
      html: '<div class="dot"></div>',
      iconSize: [20, 20],
    });

    getUserLocation((loc) => {
      L.marker([userLat, userLon], { icon: redDivIcon }).addTo(map);
    });

    restaurants.map((restaurant) => {
      let marker = L.marker([
        restaurant.location.coordinates[1],
        restaurant.location.coordinates[0],
      ]).addTo(map);
      marker.bindPopup(
        "<h3>" + restaurant.name + "</h3><p>" + restaurant.address + "</p>"
      );
    });
  });
}

/* Modal for data */

function openModal() {
  dataModal.style.display = "flex";
  document.documentElement.classList.add("modal-open");
}

// -- On page load -- //
document.addEventListener("DOMContentLoaded", () => {
  mapOutput();

  main(1);

  localStorage.setItem("menuType", "daily");
});
