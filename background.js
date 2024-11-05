// background.js

console.log("Background script loaded.");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);

  if (message.type === "application_submit") {
    const applicationData = {
      url: sender.tab.url,
      timestamp: new Date().toISOString(),
    };

    chrome.storage.sync.get(["applications"], (data) => {
      const applications = data.applications || [];
      applications.push(applicationData);

      chrome.storage.sync.set({ applications }, () => {
        console.log("Application submit event recorded:", applicationData);

        // Update badge with the number of applications
        const count = applications.length;
        chrome.action.setBadgeText({ text: count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: "#4688F1" }); // Optional: sets badge color
      });
    });
  }
});

// Initialize badge count on extension load
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["applications"], (data) => {
    const count = (data.applications || []).length;
    chrome.action.setBadgeText({ text: count.toString() });
  });
});
