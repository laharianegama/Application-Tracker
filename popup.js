// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const applicationsList = document.getElementById("applicationsList");
  const totalCount = document.getElementById("totalCount");
  const dailyTargetInput = document.getElementById("dailyTarget");
  const setTargetButton = document.getElementById("setTarget");

  // Fetch stored applications and display them
  chrome.storage.sync.get(["applications"], (data) => {
    const applications = data.applications || [];
    console.log("Retrieved applications:", applications);

    // Update the count in the popup
    totalCount.textContent = applications.length;

    if (applications.length === 0) {
      applicationsList.innerHTML = "<li>No applications tracked yet.</li>";
    } else {
      applications.forEach((app) => {
        const listItem = document.createElement("li");
        listItem.textContent = `URL: ${app.url} | Time: ${app.timestamp}`;
        applicationsList.appendChild(listItem);
      });
    }
  });

  // Load and display the saved daily target on load
  chrome.storage.sync.get(["dailyTarget"], (data) => {
    if (data.dailyTarget) {
      dailyTargetInput.value = data.dailyTarget;
    }
  });

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
