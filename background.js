// background.js
console.log("Background script loaded.");

function handleApplicationSubmission() {
  chrome.storage.sync.get(["applications"], (data) => {
    const applications = data.applications || [];
    const applicationData = {
      url: "", // Optionally capture the URL if needed
      timestamp: new Date().toISOString(),
    };
    applications.push(applicationData);

    // Save the updated applications array
    chrome.storage.sync.set(
      { applications, applicationSubmitted: false },
      () => {
        console.log(
          "Application recorded and applicationSubmitted flag reset."
        );

        // Update the badge with the count of applications
        const count = applications.length;
        chrome.action.setBadgeText({ text: count.toString() });
      }
    );
  });
}

// Listen for messages from content.js to trigger application submission handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "application_submit") {
    handleApplicationSubmission();
  }
});
