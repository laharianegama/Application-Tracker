// background.js
console.log("Background script loaded.");

// Function to handle application submission
function handleApplicationSubmission() {
  chrome.storage.sync.get(["applications"], (data) => {
    const applications = data.applications || [];
    const applicationData = {
      url: "", // Optionally capture the URL if needed
      timestamp: new Date().toISOString(),
    };
    applications.push(applicationData);

    chrome.storage.sync.set(
      { applications, applicationSubmitted: false },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error setting applications data:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log(
            "Application recorded and applicationSubmitted flag reset."
          );

          // Update the badge with the count of applications
          const count = applications.length;
          chrome.action.setBadgeText({ text: count.toString() });
        }
      }
    );
  });
}

// Listen for changes in chrome.storage to detect application submissions
chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area === "sync" &&
    changes.applicationSubmitted &&
    changes.applicationSubmitted.newValue === true
  ) {
    handleApplicationSubmission();
  }
});

// Inject content script dynamically on tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    !tab.url.startsWith("chrome://") &&
    !tab.url.startsWith("chrome-extension://")
  ) {
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        func: () => !!window.__contentScriptInjected__,
      })
      .then(([result]) => {
        if (!result.result) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"],
          });
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
              window.__contentScriptInjected__ = true;
            },
          });
        }
      })
      .catch((error) => {
        console.error("Failed to check or inject content script:", error);
      });
  }
});
