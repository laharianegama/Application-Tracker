console.log("Background script loaded.");

// Initialize storage on first load
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["applications", "dailyTarget", "streak"], (data) => {
    if (!data.applications) {
      chrome.storage.sync.set({ applications: [] });
    }
    if (!data.dailyTarget) {
      chrome.storage.sync.set({ dailyTarget: 10 });
    }
    if (!data.streak) {
      chrome.storage.sync.set({ streak: 0, lastAppliedDate: null });
    }
  });
});

// Update badge when the application count changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.applications) {
    const applicationCount = changes.applications.newValue || 0;
    chrome.action.setBadgeText({ text: applicationCount.toString() });
  }
});
