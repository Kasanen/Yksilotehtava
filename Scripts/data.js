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
  const menuItems = data.courses.map((item) => item.name);
  return menuItems;
}

async function fetchWeeklyMenu(id) {
  const data = await getMenu(
    `https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/weekly/${id}/fi`
  );

  return (data.days || []).map((day) => ({
    date: day.date,
    courses: (day.courses || []).map((c) => c.name),
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

/* -- Main menu restaurant data -- */
async function main(filterNumb) {
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
}

main(1);

// Restaurant menu modal
async function showRestaurantModal(id) {
  const restaurants = await fetchRestaurants();

  const dailyMenu = await fetchDailyMenu(restaurants[id - 1]._id);
  const dailyMenuHTML = dailyMenu.map((item) => `<li>${item}</li>`).join("");

  const weeklyMenu = await fetchWeeklyMenu(restaurants[id - 1]._id);
  const weeklyMenuHTML = weeklyMenu
    .map(
      (day) =>
        `<h3><strong>${day.date}</strong></h3>${day.courses
          .map((c) => `<li>${c}</li>`)
          .join("")}</li>`
    )
    .join("");
  const dialog = document.getElementById("Modal2");
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
          <span class="closeModal" onclick="closeModal2()">&times;</span>
            <ul>
                <h3> Päivän Menu </h3>
                ${dailyMenuHTML}
                <h3>Suosikki:
                <input type="checkbox" id="favorite" checked>
                </h3>
            </ul>
        `
      );
      break;
    case "weekly":
      modalText.insertAdjacentHTML(
        "beforeend",
        `
          <span class="closeModal" onclick="closeModal2()">&times;</span>
            <ul>
                <h3> Viikon Menu </h3>
                ${weeklyMenuHTML}
                <h3>Suosikki:
                <input type="checkbox" id="favorite" checked>
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

mapOutput();

/* Modal for data */
var dataModal = document.getElementById("Modal2");

function openModal() {
  dataModal.style.display = "flex";
  document.documentElement.classList.add("modal-open");
}

function closeModal2() {
  dataModal.style.display = "none";
  document.documentElement.classList.remove("modal-open");
}

window.onclick = function (event) {
  if (event.target == dataModal) {
    closeModal2();
  }
};
