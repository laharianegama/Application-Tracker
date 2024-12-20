console.log("Background script loaded.");

// Initialize storage on first load
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['applicationCount', 'dailyTarget', 'streak', 'lastApplicationUpdateDate', 'targetMet'], (data) => {
    if (typeof data.applicationCount === 'undefined') {
      chrome.storage.sync.set({ 
        applicationCount: 0,
        dailyTarget: 10,
        streak: 0,
        lastApplicationUpdateDate: new Date().toISOString(),
        targetMet: false,
        totalApplications: 0
      });
    }
  });
});

// Update badge when the application count changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.applicationCount) {
    const count = changes.applicationCount.newValue || 0;
    chrome.action.setBadgeText({ text: count.toString() });
  }
});

// Helper function to check if two dates are the same day in user's timezone
function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// Check for day change every hour
setInterval(() => {
  chrome.storage.sync.get(['applicationCount', 'streak', 'lastApplicationUpdateDate', 'targetMet'], (data) => {
    const today = new Date();
    const lastUpdate = data.lastApplicationUpdateDate ? new Date(data.lastApplicationUpdateDate) : null;
    
    if (lastUpdate && !isSameDay(lastUpdate, today)) {
      // New day - reset application count
      chrome.storage.sync.set({
        applicationCount: 0,
        lastApplicationUpdateDate: today.toISOString(),
        streak: data.targetMet ? (data.streak || 0) + 1 : 0,
        targetMet: false
      });
    }
  });
}, 3600000); // Check every hour
