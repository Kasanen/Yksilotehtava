# Opira — Student Restaurants Viewer

Small web project for viewing student restaurants and menus (Leaflet map + menus).

## Overview

- Static frontend built with HTML/CSS/JavaScript.
- Fetches restaurant and menu data from the Metropolia test API.
- Features: restaurant list, menu modal (daily/weekly), favorites (requires login), and a Leaflet map.

## Files of note

- `index.html` — Main page, restaurant list and map.
- `profiili.html` — Profile page (view/edit user, avatar upload).
- `Styling/` — CSS files (`style.css`, `profiiliS.css`).
- `Scripts/` — Application JS:
  - `data.js` — API helpers, sorting, rendering, and map setup.
  - `functional.js` — UI helpers (modals, burger menu, initialization).
  - `IntersectionObserver.js` — Toggles the destination button text/target.
  - `loginData.js` — Registration and login logic.
  - `profileFavorites.js` — Favorite restaurant API calls.
  - `profileFunctional.js` — Profile page: fetch/edit/avatar/delete.

## Quick start

1. To run a simple local server: use live server extension for example.

2. The app uses the browser's geolocation API — allow location access when prompted.

## Authentication / Favorite restaurant

- The app stores an auth token in `localStorage` under `token` and username under `username`.
- Register or login via the modals in the UI. Favorite restaurant require a logged-in user.

## Final changes

- Input type changed from "username" to "text". Caused troubles in style.
- Improved responsive view by removing margin from flex-item and width from dest-Btn (Style.css).

## Notes & Troubleshooting

- If map tiles or API calls fail, check network access and the third-party API availability.
