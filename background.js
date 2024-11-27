console.log("Background script loaded.");

// Initialize the storage on first load
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["applications", "dailyTarget"], (data) => {
    if (!data.applications) {
      chrome.storage.sync.set({ applications: [] });
    }
    if (!data.dailyTarget) {
      chrome.storage.sync.set({ dailyTarget: 10 });
    }
  });
});
