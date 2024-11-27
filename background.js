console.log("Background script loaded.");

// Initialize the storage on first load
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["applications", "dailyTarget"], (data) => {
    if (!data.applications) {
      chrome.storage.sync.set({ applications: 0 });
    }
    if (!data.dailyTarget) {
      chrome.storage.sync.set({ dailyTarget: 10 });
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
