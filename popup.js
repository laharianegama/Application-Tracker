// popup.js

// Helper function to update the progress circle based on current count and target
function updateProgress(applicationCount, dailyTarget) {
  const progressCircle = document.querySelector(".progress-circle-fill");
  const radius = 54; // Radius must match the CSS/SVG settings
  const circumference = 2 * Math.PI * radius;

  if (dailyTarget > 0) {
    const progress = Math.min(applicationCount / dailyTarget, 1); // Cap at 100%
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = offset;
  } else {
    // Reset if no target is set
    progressCircle.style.strokeDashoffset = circumference;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const applicationsList = document.getElementById("applicationsList");
  const totalCount = document.getElementById("totalCount");
  const dailyTargetInput = document.getElementById("dailyTarget");
  const setTargetButton = document.getElementById("setTarget");

  // Fetch stored applications and display them
  chrome.storage.sync.get(
    ["applications", "applicationCount", "dailyTarget"],
    (data) => {
      const applications = data.applications || [];
      const applicationCount = data.applicationCount || 0;
      const dailyTarget = data.dailyTarget || 0;

      // Update the application count and target in the popup
      totalCount.textContent = applicationCount;
      dailyTargetInput.value = dailyTarget;

      // Update the progress bar
      updateProgress(applicationCount, dailyTarget);

      // Display tracked applications
      if (applications.length === 0) {
        applicationsList.innerHTML = "<li>No applications tracked yet.</li>";
      } else {
        applications.forEach((app) => {
          const listItem = document.createElement("li");
          listItem.textContent = `URL: ${app.url} | Time: ${app.timestamp}`;
          applicationsList.appendChild(listItem);
        });
      }
    }
  );

  // Save daily target when the button is clicked
  setTargetButton.addEventListener("click", () => {
    const dailyTarget = parseInt(dailyTargetInput.value);
    if (!isNaN(dailyTarget) && dailyTarget > 0) {
      chrome.storage.sync.set({ dailyTarget }, () => {
        alert(`Daily target set to ${dailyTarget}`);
      });
    } else {
      alert("Please enter a valid target number.");
    }
  });
});
