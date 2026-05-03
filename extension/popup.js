const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const ICONS = {
  check: {
    viewBox: "0 0 448 512",
    path: "M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z",
  },
  cloudMoon: {
    viewBox: "0 0 640 512",
    path: "M495.8 0c5.5 0 10.9 .2 16.3 .7c7 .6 12.8 5.7 14.3 12.5s-1.6 13.9-7.7 17.3c-44.4 25.2-74.4 73-74.4 127.8c0 81 65.5 146.6 146.2 146.6c8.6 0 17-.7 25.1-2.1c6.9-1.2 13.8 2.2 17 8.5s1.9 13.8-3.1 18.7c-34.5 33.6-81.7 54.4-133.6 54.4c-9.3 0-18.4-.7-27.4-1.9c-11.2-22.6-29.8-40.9-52.6-51.7c-2.7-58.5-50.3-105.3-109.2-106.7c-1.7-10.4-2.6-21-2.6-31.8C304 86.1 389.8 0 495.8 0zM447.9 431.9c0 44.2-35.8 80-80 80L96 511.9c-53 0-96-43-96-96c0-47.6 34.6-87 80-94.6l0-1.3c0-53 43-96 96-96c34.9 0 65.4 18.6 82.2 46.4c13-9.1 28.8-14.4 45.8-14.4c44.2 0 80 35.8 80 80c0 5.9-.6 11.7-1.9 17.2c37.4 6.7 65.8 39.4 65.8 78.7z",
  },
  sun: {
    viewBox: "0 0 512 512",
    path: "M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z",
  },
  cloudSun: {
    viewBox: "0 0 640 512",
    path: "M294.2 1.2c5.1 2.1 8.7 6.7 9.6 12.1l14.1 84.7 84.7 14.1c5.4 .9 10 4.5 12.1 9.6s1.5 10.9-1.6 15.4l-38.5 55c-2.2-.1-4.4-.2-6.7-.2c-23.3 0-45.1 6.2-64 17.1l0-1.1c0-53-43-96-96-96s-96 43-96 96s43 96 96 96c8.1 0 15.9-1 23.4-2.9c-36.6 18.1-63.3 53.1-69.8 94.9l-24.4 17c-4.5 3.2-10.3 3.8-15.4 1.6s-8.7-6.7-9.6-12.1L98.1 317.9 13.4 303.8c-5.4-.9-10-4.5-12.1-9.6s-1.5-10.9 1.6-15.4L52.5 208 2.9 137.2c-3.2-4.5-3.8-10.3-1.6-15.4s6.7-8.7 12.1-9.6L98.1 98.1l14.1-84.7c.9-5.4 4.5-10 9.6-12.1s10.9-1.5 15.4 1.6L208 52.5 278.8 2.9c4.5-3.2 10.3-3.8 15.4-1.6zM144 208a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM639.9 431.9c0 44.2-35.8 80-80 80l-271.9 0c-53 0-96-43-96-96c0-47.6 34.6-87 80-94.6l0-1.3c0-53 43-96 96-96c34.9 0 65.4 18.6 82.2 46.4c13-9.1 28.8-14.4 45.8-14.4c44.2 0 80 35.8 80 80c0 5.9-.6 11.7-1.9 17.2c37.4 6.7 65.8 39.4 65.8 78.7z",
  },
  moon: {
    viewBox: "0 0 384 512",
    path: "M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z",
  },
};

const STORAGE_KEYS = {
  location: "imanvibes-extension-location-v1",
  prayers: "imanvibes-extension-prayers-v1",
  notificationPrefs: "imanvibes-extension-notification-prefs-v1",
  theme: "theme",
};

const URLS = {
  website: "https://imanvibes.vercel.app",
  github: "https://github.com/moayaan1911/imanvibes",
  developer: "https://moayaan.com",
  extension: "https://chromewebstore.google.com/detail/mdgclabcabbbikdgmihabnaeplkfnnkb?utm_source=item-share-cb",
  support: "https://moayaan.com/support",
};

const THEME_COLOR = {
  light: "#fff9ef",
  dark: "#0f1512",
};

const state = {
  location: null,
  prayerTimes: null,
  hijri: null,
  prayerHistory: {},
  notificationPrefs: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
  notificationPermission: "loading",
  locationPermission: "loading",
  theme: "light",
  now: new Date(),
  searchOpen: false,
  searchTimer: null,
  settingsOpen: false,
};

const els = {
  timingEyebrow: document.getElementById("timingEyebrow"),
  nextPrayerName: document.getElementById("nextPrayerName"),
  nextPrayerTime: document.getElementById("nextPrayerTime"),
  locationPill: document.getElementById("locationPill"),
  searchButton: document.getElementById("searchButton"),
  searchForm: document.getElementById("searchForm"),
  cityInput: document.getElementById("cityInput"),
  suggestions: document.getElementById("suggestions"),
  remainingLabel: document.getElementById("remainingLabel"),
  remainingTime: document.getElementById("remainingTime"),
  hijriDate: document.getElementById("hijriDate"),
  completedCount: document.getElementById("completedCount"),
  trackerRow: document.getElementById("trackerRow"),
  scheduleList: document.getElementById("scheduleList"),
  statusLine: document.getElementById("statusLine"),
  supportButton: document.getElementById("supportButton"),
  goToImanVibesButton: document.getElementById("goToImanVibesButton"),
  settingsButton: document.getElementById("settingsButton"),
  settingsOverlay: document.getElementById("settingsOverlay"),
  settingsCloseButton: document.getElementById("settingsCloseButton"),
  notificationStatus: document.getElementById("notificationStatus"),
  notificationButton: document.getElementById("notificationButton"),
  notificationPrefs: document.getElementById("notificationPrefs"),
  themeToggleButton: document.getElementById("themeToggleButton"),
  themeToggleIcon: document.getElementById("themeToggleIcon"),
  themeToggleLabel: document.getElementById("themeToggleLabel"),
  shareButton: document.getElementById("copyStoreButton"),
  shareButtonLabel: document.getElementById("copyStoreLabel"),
};

applyTheme(getInitialTheme(), false);

function storageGet(key) {
  return new Promise((resolve) => {
    const extensionStorage = globalThis.chrome?.storage?.local;

    if (!extensionStorage) {
      try {
        const raw = localStorage.getItem(key);
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(null);
      }
      return;
    }

    extensionStorage.get(key, (result) => resolve(result[key] ?? null));
  });
}

function storageSet(key, value) {
  return new Promise((resolve) => {
    const extensionStorage = globalThis.chrome?.storage?.local;

    if (!extensionStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
      resolve();
      return;
    }

    extensionStorage.set({ [key]: value }, resolve);
  });
}

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    return stored === "dark" || stored === "light" ? stored : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme, persist = true) {
  state.theme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.style.colorScheme = state.theme;

  try {
    localStorage.setItem(STORAGE_KEYS.theme, state.theme);
  } catch {}

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[state.theme]);

  if (persist) void storageSet(STORAGE_KEYS.theme, state.theme);
  renderThemeToggle();
}

function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getAladhanDate(date = new Date()) {
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

function createEmptyDailyPrayers() {
  return {
    Fajr: { completedAt: null },
    Dhuhr: { completedAt: null },
    Asr: { completedAt: null },
    Maghrib: { completedAt: null },
    Isha: { completedAt: null },
  };
}

function getTodayPrayers() {
  return state.prayerHistory[getDateKey()] || createEmptyDailyPrayers();
}

function isPrayerCompleted(completion) {
  return Boolean(completion?.completedAt || completion?.legacyCompleted);
}

function getTimeParts(time) {
  const match = String(time || "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

function getMinutesFromTime(time) {
  const parts = getTimeParts(time);
  return parts ? parts.hours * 60 + parts.minutes : null;
}

function getNextPrayer(times, now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const ordered = PRAYERS.map((name) => ({ name, time: times[name] }));
  return ordered.find((prayer) => {
    const minutes = getMinutesFromTime(prayer.time);
    return minutes !== null && minutes > currentMinutes;
  }) || ordered[0];
}

function getPrayerWindowEndTime(name, times) {
  if (name === "Fajr") return times.Sunrise;
  if (name === "Dhuhr") return times.Asr;
  if (name === "Asr") return times.Maghrib;
  if (name === "Maghrib") return times.Isha;
  return null;
}

function getPrayerWindowEndMinutes(name, times) {
  const endTime = getPrayerWindowEndTime(name, times);
  return endTime ? getMinutesFromTime(endTime) : null;
}

function getMostRecentOverduePrayer(times, prayers, now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const overdue = PRAYERS.filter((name) => {
    if (isPrayerCompleted(prayers[name])) return false;
    const endMinutes = getPrayerWindowEndMinutes(name, times);
    return endMinutes !== null && currentMinutes >= endMinutes;
  });
  return overdue.length ? overdue[overdue.length - 1] : null;
}

function didCompleteInQaza(name, completion, times, today = new Date()) {
  if (completion?.legacyCompleted || !completion?.completedAt) return false;
  const completedAt = new Date(completion.completedAt);
  if (Number.isNaN(completedAt.getTime())) return false;
  const endTime = getPrayerWindowEndTime(name, times);
  const parts = getTimeParts(endTime);
  if (!parts) return false;
  const cutoff = new Date(today);
  cutoff.setHours(parts.hours, parts.minutes, 0, 0);
  return completedAt >= cutoff;
}

function getPrayerScheduleStatus(name, times, prayers, now = new Date(), latestOverduePrayer) {
  const completion = prayers[name];
  if (isPrayerCompleted(completion)) {
    return didCompleteInQaza(name, completion, times, now) ? "completed_qaza" : "completed";
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = getMinutesFromTime(times[name]);
  const endMinutes = getPrayerWindowEndMinutes(name, times);

  if (startMinutes !== null && currentMinutes >= startMinutes && (endMinutes === null || currentMinutes < endMinutes)) {
    return "now";
  }

  if (latestOverduePrayer === name) return "qaza";
  if (endMinutes !== null && currentMinutes >= endMinutes) return "missed";
  return "upcoming";
}

function getStatusLabel(status) {
  if (status === "now") return "Now";
  if (status === "completed") return "Completed";
  if (status === "completed_qaza") return "Completed in Qaza";
  if (status === "qaza") return "Qaza";
  if (status === "missed") return "Missed";
  return "";
}

function getTimeUntilDetailed(time, now = new Date()) {
  const parts = getTimeParts(time);
  if (!parts) return "--:--:--";
  const target = new Date(now);
  target.setHours(parts.hours, parts.minutes, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatTimeLabel(time) {
  const parts = getTimeParts(time);
  if (!parts) return time || "--";
  const value = new Date();
  value.setHours(parts.hours, parts.minutes, 0, 0);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
}

function formatHijri(hijri) {
  if (!hijri?.day || !hijri?.month?.en || !hijri?.year) return "Location needed";
  return `${hijri.day} ${hijri.month.en} ${hijri.year}`;
}

function setStatus(message) {
  els.statusLine.textContent = message || "";
}

function getIconSvg(iconName, className) {
  const icon = ICONS[iconName];
  return `<svg class="${className}" viewBox="${icon.viewBox}" aria-hidden="true"><path d="${icon.path}"></path></svg>`;
}

function setSvgIcon(element, iconName) {
  const icon = ICONS[iconName];
  if (!element || !icon) return;
  element.setAttribute("viewBox", icon.viewBox);
  element.innerHTML = `<path d="${icon.path}"></path>`;
}

function getNotificationPermission() {
  if (globalThis.chrome?.notifications && globalThis.chrome?.alarms) return "granted";
  if (!("Notification" in window)) return "unavailable";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return "prompt";
}

async function refreshLocationPermission() {
  if (!navigator.permissions?.query) {
    state.locationPermission = navigator.geolocation ? "prompt" : "unavailable";
    return;
  }

  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    state.locationPermission = result.state;
  } catch {
    state.locationPermission = navigator.geolocation ? "prompt" : "unavailable";
  }
}

function getLocationStatusLabel() {
  if (state.location?.label) return state.location.label;
  if (state.location) return `${state.location.lat.toFixed(2)}, ${state.location.lng.toFixed(2)}`;
  if (state.locationPermission === "granted") return "Allowed";
  if (state.locationPermission === "denied") return "Blocked";
  if (state.locationPermission === "unavailable") return "Unavailable";
  return "Ask first";
}

function getNotificationStatusLabel() {
  if (state.notificationPermission === "granted") return "Allowed";
  if (state.notificationPermission === "denied") return "Blocked";
  if (state.notificationPermission === "unavailable") return "Unavailable";
  if (state.notificationPermission === "loading") return "Checking";
  return "Ask first";
}

function renderThemeToggle() {
  if (!els.themeToggleButton) return;

  const nextLabel = state.theme === "dark" ? "Light mode" : "Dark mode";
  const nextIcon = state.theme === "dark" ? "sun" : "moon";
  els.themeToggleLabel.textContent = nextLabel;
  els.themeToggleButton.setAttribute("aria-label", `Switch to ${state.theme === "dark" ? "light" : "dark"} mode`);
  setSvgIcon(els.themeToggleIcon, nextIcon);
}

function renderNotificationPrefs() {
  if (!els.notificationPrefs) return;

  const notificationsAllowed = state.notificationPermission === "granted";
  els.notificationPrefs.innerHTML = "";

  PRAYERS.forEach((prayer) => {
    const active = notificationsAllowed && state.notificationPrefs[prayer] === true;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `prayer-toggle ${active ? "active" : ""}`;
    button.role = "switch";
    button.setAttribute("aria-checked", String(active));
    button.disabled = !notificationsAllowed;
    button.innerHTML = `
      <span>${prayer}</span>
      <span class="toggle-track"><span class="toggle-knob"></span></span>
    `;
    button.addEventListener("click", () => toggleNotificationPref(prayer));
    els.notificationPrefs.append(button);
  });
}

function renderSettings() {
  state.notificationPermission = getNotificationPermission();

  els.notificationStatus.textContent = getNotificationStatusLabel();
  els.notificationButton.hidden = state.notificationPermission === "granted";
  els.notificationButton.disabled =
    state.notificationPermission === "denied" || state.notificationPermission === "unavailable";
  els.notificationButton.textContent =
    state.notificationPermission === "denied"
      ? "Blocked"
      : state.notificationPermission === "unavailable"
        ? "Unavailable"
        : "Allow";

  renderThemeToggle();
  renderNotificationPrefs();
}

function renderTracker() {
  const todayPrayers = getTodayPrayers();
  const completedCount = PRAYERS.filter((name) => isPrayerCompleted(todayPrayers[name])).length;
  els.completedCount.textContent = `${completedCount}/5 Completed`;
  els.trackerRow.innerHTML = "";

  PRAYERS.forEach((name, index) => {
    const item = document.createElement("div");
    item.className = "tracker-item";

    const stack = document.createElement("div");
    stack.className = "tracker-stack";

    const button = document.createElement("button");
    button.type = "button";
    button.className = `tracker-check ${isPrayerCompleted(todayPrayers[name]) ? "completed" : ""}`;
    button.setAttribute("aria-label", `Toggle ${name}`);
    button.innerHTML = isPrayerCompleted(todayPrayers[name]) ? getIconSvg("check", "tracker-check-icon") : "";
    button.addEventListener("click", () => togglePrayer(name));

    const label = document.createElement("span");
    label.className = "tracker-name";
    label.textContent = name;

    stack.append(button, label);
    item.append(stack);

    if (index < PRAYERS.length - 1) {
      const line = document.createElement("span");
      line.className = "tracker-line";
      item.append(line);
    }

    els.trackerRow.append(item);
  });
}

function renderSchedule() {
  els.scheduleList.innerHTML = "";
  const icons = { Fajr: "cloudMoon", Dhuhr: "sun", Asr: "cloudSun", Maghrib: "moon", Isha: "moon" };

  if (!state.prayerTimes) {
    PRAYERS.forEach((name) => {
      const row = document.createElement("div");
      row.className = "schedule-row upcoming";
      row.innerHTML = `<div class="schedule-left">${getIconSvg(icons[name], "prayer-icon")}<span class="schedule-name">${name}</span></div><div class="schedule-right"><span class="schedule-time">--:--</span></div>`;
      els.scheduleList.append(row);
    });
    return;
  }

  const todayPrayers = getTodayPrayers();
  const latestOverduePrayer = getMostRecentOverduePrayer(state.prayerTimes, todayPrayers, state.now);

  PRAYERS.forEach((name) => {
    const status = getPrayerScheduleStatus(name, state.prayerTimes, todayPrayers, state.now, latestOverduePrayer);
    const row = document.createElement("div");
    row.className = `schedule-row ${status.replace("_", "-")}`;

    const statusLabel = getStatusLabel(status);
    row.innerHTML = `
      <div class="schedule-left">
        ${getIconSvg(icons[name], "prayer-icon")}
        <span class="schedule-name">${name}</span>
      </div>
      <div class="schedule-right">
        ${statusLabel ? `<span class="status-pill">${statusLabel}</span>` : ""}
        <span class="schedule-time">${formatTimeLabel(state.prayerTimes[name])}</span>
      </div>
    `;
    els.scheduleList.append(row);
  });
}

function renderTiming() {
  const nextPrayer = state.prayerTimes ? getNextPrayer(state.prayerTimes, state.now) : null;

  els.locationPill.hidden = !state.location;
  els.locationPill.innerHTML = state.location
    ? `<svg width="10" height="10" viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>${state.location.label}`
    : "";

  els.timingEyebrow.textContent = state.prayerTimes ? "Next Prayer" : "Prayer Times";
  els.nextPrayerName.textContent = nextPrayer ? nextPrayer.name : "Disabled";
  els.nextPrayerTime.hidden = !nextPrayer;
  els.nextPrayerTime.textContent = nextPrayer ? formatTimeLabel(nextPrayer.time) : "";
  els.hijriDate.textContent = formatHijri(state.hijri);

  if (nextPrayer) {
    els.remainingLabel.textContent = "Remaining Time";
    els.remainingTime.textContent = getTimeUntilDetailed(nextPrayer.time, state.now);
  } else {
    els.remainingLabel.textContent = "Add your city to see timings";
    els.remainingTime.textContent = "Tap the search icon and select your city.";
  }
}

function render() {
  renderTiming();
  renderTracker();
  renderSchedule();
}

async function fetchPrayerTimes(location) {
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${getAladhanDate()}?latitude=${location.lat}&longitude=${location.lng}&method=2`,
  );
  if (!response.ok) throw new Error("Prayer timings failed");
  const payload = await response.json();
  const timings = payload.data?.timings;
  if (!timings) throw new Error("Prayer timings missing");

  state.prayerTimes = {
    Fajr: timings.Fajr,
    Sunrise: timings.Sunrise,
    Dhuhr: timings.Dhuhr,
    Asr: timings.Asr,
    Maghrib: timings.Maghrib,
    Isha: timings.Isha,
  };
  state.hijri = payload.data?.date?.hijri || null;
  await syncNotificationAlarms();
  render();
}

async function saveLocation(location) {
  state.location = {
    ...location,
    updatedAt: new Date().toISOString(),
  };
  await storageSet(STORAGE_KEYS.location, state.location);
  await fetchPrayerTimes(state.location);
  await refreshLocationPermission();
  renderSettings();
}

async function searchCities(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    els.suggestions.innerHTML = "";
    return;
  }

  els.suggestions.innerHTML = `<button class="suggestion-button" type="button">Searching...</button>`;

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`,
    );
    if (!response.ok) throw new Error("City search failed");
    const payload = await response.json();
    const results = payload.results || [];

    if (!results.length) {
      els.suggestions.innerHTML = `<button class="suggestion-button" type="button">No city found</button>`;
      return;
    }

    els.suggestions.innerHTML = "";
    results.forEach((result) => {
      const label = [result.name, result.admin1, result.country].filter(Boolean).join(", ");
      const button = document.createElement("button");
      button.className = "suggestion-button";
      button.type = "button";
      button.innerHTML = `${result.name}<span>${[result.admin1, result.country].filter(Boolean).join(", ")}</span>`;
      button.addEventListener("click", async () => {
        setStatus("Saving city...");
        await saveLocation({
          lat: result.latitude,
          lng: result.longitude,
          label,
        });
        state.searchOpen = false;
        els.searchForm.hidden = true;
        els.cityInput.value = "";
        els.suggestions.innerHTML = "";
        setStatus("");
      });
      els.suggestions.append(button);
    });
  } catch {
    els.suggestions.innerHTML = `<button class="suggestion-button" type="button">Could not search city</button>`;
  }
}

function openExternal(url) {
  if (globalThis.chrome?.tabs?.create) {
    chrome.tabs.create({ url });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

async function openSettings() {
  state.settingsOpen = true;
  els.settingsOverlay.hidden = false;
  await refreshLocationPermission();
  renderSettings();
}

function closeSettings() {
  state.settingsOpen = false;
  els.settingsOverlay.hidden = true;
}

async function requestNotificationPermission() {
  if (globalThis.chrome?.notifications && globalThis.chrome?.alarms) {
    state.notificationPermission = "granted";
    renderSettings();
    await syncNotificationAlarms();
    return;
  }

  if (!("Notification" in window)) {
    state.notificationPermission = "unavailable";
    renderSettings();
    return;
  }

  els.notificationButton.disabled = true;
  els.notificationButton.textContent = "Working...";

  try {
    await Notification.requestPermission();
  } finally {
    state.notificationPermission = getNotificationPermission();
    renderSettings();
  }
}

async function toggleNotificationPref(prayer) {
  if (state.notificationPermission !== "granted") return;

  state.notificationPrefs = {
    ...state.notificationPrefs,
    [prayer]: !state.notificationPrefs[prayer],
  };

  await storageSet(STORAGE_KEYS.notificationPrefs, state.notificationPrefs);
  await syncNotificationAlarms();
  renderSettings();
}

function clearPrayerAlarms() {
  return new Promise((resolve) => {
    if (!globalThis.chrome?.alarms) {
      resolve();
      return;
    }

    chrome.alarms.getAll((alarms) => {
      const prayerAlarms = alarms.filter((alarm) => alarm.name.startsWith("imanvibes-prayer-"));

      if (!prayerAlarms.length) {
        resolve();
        return;
      }

      let remaining = prayerAlarms.length;
      prayerAlarms.forEach((alarm) => {
        chrome.alarms.clear(alarm.name, () => {
          remaining -= 1;
          if (remaining === 0) resolve();
        });
      });
    });
  });
}

async function syncNotificationAlarms() {
  if (!globalThis.chrome?.alarms || state.notificationPermission !== "granted" || !state.prayerTimes) {
    return;
  }

  await clearPrayerAlarms();

  const now = new Date();
  PRAYERS.forEach((prayer) => {
    if (!state.notificationPrefs[prayer]) return;

    const parts = getTimeParts(state.prayerTimes[prayer]);
    if (!parts) return;

    const scheduledAt = new Date(now);
    scheduledAt.setHours(parts.hours, parts.minutes, 0, 0);
    if (scheduledAt <= now) return;

    chrome.alarms.create(`imanvibes-prayer-${getDateKey(now)}-${prayer}`, {
      when: scheduledAt.getTime(),
    });
  });
}

async function copyStoreLink() {
  els.shareButton.disabled = true;
  els.shareButtonLabel.textContent = "Copying...";

  const promoText = `✨ ImanVibes — Quranic comfort for every mood\n\n📖 Quran by Mood · 💬 Hadith · 📿 99 Names\n🤲 Duas · 🕌 Prayer Times · 📿 Tasbih\n\n🌐 ${URLS.website}\n🧩 ${URLS.extension}`;

  try {
    await navigator.clipboard.writeText(promoText);
    els.shareButtonLabel.textContent = "Copied!";
  } catch {
    els.shareButtonLabel.textContent = "Try again";
  } finally {
    window.setTimeout(() => {
      els.shareButton.disabled = false;
      els.shareButtonLabel.textContent = "Share Extension";
    }, 1600);
  }
}

function toggleTheme() {
  applyTheme(state.theme === "dark" ? "light" : "dark");
}

async function togglePrayer(name) {
  const todayKey = getDateKey();
  const current = state.prayerHistory[todayKey] || createEmptyDailyPrayers();
  const nextCompleted = !isPrayerCompleted(current[name]);

  state.prayerHistory = {
    ...state.prayerHistory,
    [todayKey]: {
      ...current,
      [name]: nextCompleted ? { completedAt: new Date().toISOString() } : { completedAt: null },
    },
  };

  await storageSet(STORAGE_KEYS.prayers, state.prayerHistory);
  render();
}

async function init() {
  state.location = await storageGet(STORAGE_KEYS.location);
  state.prayerHistory = (await storageGet(STORAGE_KEYS.prayers)) || {};
  state.notificationPrefs = {
    ...state.notificationPrefs,
    ...((await storageGet(STORAGE_KEYS.notificationPrefs)) || {}),
  };

  const storedTheme = await storageGet(STORAGE_KEYS.theme);
  if (storedTheme === "dark" || storedTheme === "light") {
    applyTheme(storedTheme, false);
  }

  await refreshLocationPermission();
  state.notificationPermission = getNotificationPermission();

  render();
  renderSettings();

  if (state.location) {
    setStatus("Loading prayer times...");
    try {
      await fetchPrayerTimes(state.location);
      setStatus("");
    } catch {
      setStatus("Could not load prayer times.");
    }
  }
}

els.supportButton.addEventListener("click", () => openExternal(URLS.support));
els.goToImanVibesButton.addEventListener("click", () => openExternal(URLS.website));
els.settingsButton.addEventListener("click", () => void openSettings());
els.settingsCloseButton.addEventListener("click", closeSettings);
els.settingsOverlay.addEventListener("click", (event) => {
  if (event.target === els.settingsOverlay) closeSettings();
});
els.notificationButton.addEventListener("click", () => void requestNotificationPermission());
els.themeToggleButton.addEventListener("click", toggleTheme);
els.shareButton.addEventListener("click", () => void copyStoreLink());

document.querySelectorAll(".quick-link-btn").forEach((button) => {
  button.addEventListener("click", () => openExternal(button.dataset.url));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.settingsOpen) closeSettings();
});

els.searchButton.addEventListener("click", () => {
  state.searchOpen = !state.searchOpen;
  els.searchForm.hidden = !state.searchOpen;
  if (state.searchOpen) els.cityInput.focus();
});

els.cityInput.addEventListener("input", () => {
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(() => searchCities(els.cityInput.value), 250);
});

els.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchCities(els.cityInput.value);
});

window.setInterval(() => {
  state.now = new Date();
  render();
}, 1000);

init();
