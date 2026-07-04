const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const STORAGE_KEYS = {
  location: "imanvibes-extension-location-v1",
  prayers: "imanvibes-extension-prayers-v1",
  notificationPrefs: "imanvibes-extension-notification-prefs-v1",
  theme: "theme",
};

const PRAYER_NOTIFICATION_COPY = {
  Fajr: "It is time for Fajr. Begin the day with prayer and calm.",
  Dhuhr: "It is time for Dhuhr. Step away for a few quiet minutes of prayer.",
  Asr: "It is time for Asr. Return to prayer before the day slips away.",
  Maghrib: "It is time for Maghrib. Let the evening begin with prayer.",
  Isha: "It is time for Isha. End the night with prayer and reflection.",
};

chrome.runtime.setUninstallURL("https://forms.gle/FtnaJx3xQ8udLpJS7");

function storageGet(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => resolve(result[key] ?? null));
  });
}

function storageSet(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

function getDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getAladhanDate(date = new Date()) {
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

function getTimeParts(time) {
  const match = String(time || "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

function getPrayerTimesForDate(location, date = new Date()) {
  return fetch(
    `https://api.aladhan.com/v1/timings/${getAladhanDate(date)}?latitude=${location.lat}&longitude=${location.lng}&method=2`,
  )
    .then((response) => {
      if (!response.ok) throw new Error("Prayer timings failed");
      return response.json();
    })
    .then((payload) => {
      const timings = payload.data?.timings;
      if (!timings) throw new Error("Prayer timings missing");
      return {
        Fajr: timings.Fajr,
        Sunrise: timings.Sunrise,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha,
      };
    });
}

function clearPrayerAlarms() {
  return new Promise((resolve) => {
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

async function syncNotificationAlarms({ prayerTimes } = {}) {
  if (!chrome.alarms) return;

  const [location, storedPrefs] = await Promise.all([
    storageGet(STORAGE_KEYS.location),
    storageGet(STORAGE_KEYS.notificationPrefs),
  ]);

  if (!location || !location.lat || !location.lng) return;

  const prefs = {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
    ...storedPrefs,
  };

  let times = prayerTimes;
  if (!times) {
    try {
      times = await getPrayerTimesForDate(location);
    } catch {
      return;
    }
  }

  await clearPrayerAlarms();

  const now = new Date();
  let scheduledForKey = now;
  PRAYERS.forEach((prayer) => {
    if (!prefs[prayer]) return;

    const parts = getTimeParts(times[prayer]);
    if (!parts) return;

    const scheduledAt = new Date(scheduledForKey);
    scheduledAt.setHours(parts.hours, parts.minutes, 0, 0);
    if (scheduledAt <= now) {
      scheduledAt.setDate(scheduledAt.getDate() + 1);
    }

    chrome.alarms.create(`imanvibes-prayer-${getDateKey(scheduledAt)}-${prayer}`, {
      when: scheduledAt.getTime(),
    });
  });
}

async function bootstrapAlarms() {
  try {
    await syncNotificationAlarms();
  } catch (error) {
    console.error("ImanVibes alarm bootstrap failed:", error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  bootstrapAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  bootstrapAlarms();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith("imanvibes-prayer-")) return;

  const prayer = alarm.name.split("-").at(-1);
  if (!PRAYER_NOTIFICATION_COPY[prayer]) return;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "assets/icon.png",
    title: `${prayer} prayer time`,
    message: PRAYER_NOTIFICATION_COPY[prayer],
    priority: 2,
  });

  bootstrapAlarms();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "imanvibes-sync-alarms") {
    bootstrapAlarms().then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});