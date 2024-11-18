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
