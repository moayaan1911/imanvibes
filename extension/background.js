const PRAYER_NOTIFICATION_COPY = {
  Fajr: "It is time for Fajr. Begin the day with prayer and calm.",
  Dhuhr: "It is time for Dhuhr. Step away for a few quiet minutes of prayer.",
  Asr: "It is time for Asr. Return to prayer before the day slips away.",
  Maghrib: "It is time for Maghrib. Let the evening begin with prayer.",
  Isha: "It is time for Isha. End the night with prayer and reflection.",
};

chrome.runtime.setUninstallURL("https://forms.gle/FtnaJx3xQ8udLpJS7");

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
});
