const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const STORAGE_KEYS = {
  location: "imanvibes-extension-location-v1",
  prayers: "imanvibes-extension-prayers-v1",
};

const state = {
  location: null,
  prayerTimes: null,
  hijri: null,
  prayerHistory: {},
  now: new Date(),
  searchOpen: false,
  searchTimer: null,
};

const els = {
  timingEyebrow: document.getElementById("timingEyebrow"),
  nextPrayerName: document.getElementById("nextPrayerName"),
  nextPrayerTime: document.getElementById("nextPrayerTime"),
  locationButton: document.getElementById("locationButton"),
  searchButton: document.getElementById("searchButton"),
  searchForm: document.getElementById("searchForm"),
  cityInput: document.getElementById("cityInput"),
  suggestions: document.getElementById("suggestions"),
  remainingLabel: document.getElementById("remainingLabel"),
  remainingTime: document.getElementById("remainingTime"),
  hijriDate: document.getElementById("hijriDate"),
  locationLabel: document.getElementById("locationLabel"),
  countdownLabel: document.getElementById("countdownLabel"),
  countdownValue: document.getElementById("countdownValue"),
  completedCount: document.getElementById("completedCount"),
  trackerRow: document.getElementById("trackerRow"),
  scheduleList: document.getElementById("scheduleList"),
  statusLine: document.getElementById("statusLine"),
};

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
    button.textContent = isPrayerCompleted(todayPrayers[name]) ? "✓" : "";
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

  if (!state.prayerTimes) {
    PRAYERS.forEach((name) => {
      const row = document.createElement("div");
      row.className = "schedule-row";
      row.innerHTML = `<div class="schedule-left"><span class="prayer-icon">•</span><span class="schedule-name">${name}</span></div><div class="schedule-right"><span class="schedule-time">--:--</span></div>`;
      els.scheduleList.append(row);
    });
    return;
  }

  const todayPrayers = getTodayPrayers();
  const latestOverduePrayer = getMostRecentOverduePrayer(state.prayerTimes, todayPrayers, state.now);
  const icons = { Fajr: "☾", Dhuhr: "☼", Asr: "☁", Maghrib: "☾", Isha: "☾" };

  PRAYERS.forEach((name) => {
    const status = getPrayerScheduleStatus(name, state.prayerTimes, todayPrayers, state.now, latestOverduePrayer);
    const row = document.createElement("div");
    row.className = `schedule-row ${status.replace("_", "-")}`;

    const statusLabel = getStatusLabel(status);
    row.innerHTML = `
      <div class="schedule-left">
        <span class="prayer-icon">${icons[name]}</span>
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

  els.timingEyebrow.textContent = state.prayerTimes ? "Next Prayer" : "Prayer Times";
  els.nextPrayerName.textContent = nextPrayer ? nextPrayer.name : "Disabled";
  els.nextPrayerTime.hidden = !nextPrayer;
  els.nextPrayerTime.textContent = nextPrayer ? formatTimeLabel(nextPrayer.time) : "";
  els.locationLabel.textContent = state.location?.label || "Tap to fetch location";
  els.hijriDate.textContent = formatHijri(state.hijri);

  if (nextPrayer) {
    els.remainingLabel.textContent = "Remaining Time";
    els.remainingTime.textContent = getTimeUntilDetailed(nextPrayer.time, state.now);
    els.countdownLabel.textContent = `Next: ${nextPrayer.name}`;
    els.countdownValue.textContent = getTimeUntilDetailed(nextPrayer.time, state.now);
  } else {
    els.remainingLabel.textContent = "Enable Location access to See timings";
    els.remainingTime.textContent = "Tap the location icon or search your city.";
    els.countdownLabel.textContent = "Loading prayer times";
    els.countdownValue.textContent = "--:--:--";
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
  render();
}

function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    });
  });
}

async function saveLocation(location) {
  state.location = {
    ...location,
    updatedAt: new Date().toISOString(),
  };
  await storageSet(STORAGE_KEYS.location, state.location);
  await fetchPrayerTimes(state.location);
}

async function fetchCurrentLocation() {
  setStatus("Fetching location...");
  els.locationButton.disabled = true;

  try {
    const position = await getBrowserLocation();
    await saveLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      label: "Current location",
    });
    setStatus("");
  } catch {
    setStatus("Location blocked. Search your city instead.");
  } finally {
    els.locationButton.disabled = false;
  }
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

  render();

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

els.locationButton.addEventListener("click", fetchCurrentLocation);
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
