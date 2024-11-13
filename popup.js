function updateProgress(applicationCount, dailyTarget) {
  const progressCircle = document.querySelector(".progress-circle-fill");
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  if (dailyTarget > 0) {
    const progress = Math.min(applicationCount / dailyTarget, 1); // Cap at 100%
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = offset;
  } else {
    progressCircle.style.strokeDashoffset = circumference;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const applicationsList = document.getElementById("applicationsList");
  const totalCount = document.getElementById("totalCount");
  const dailyTargetInput = document.getElementById("dailyTarget");
  const dailyTargetDisplay = document.getElementById("dailyTargetDisplay");
  const setTargetButton = document.getElementById("setTarget");

  // Fetch stored applications and display them
  chrome.storage.sync.get(["applications", "dailyTarget"], (data) => {
    console.log("Data retrieved from storage:", data);
    const applications = data.applications || [];
    const applicationCount = applications.length;
    const dailyTarget = data.dailyTarget || 0;

    // Update the counts in the popup
    totalCount.textContent = applicationCount;
    dailyTargetDisplay.textContent = dailyTarget;
    dailyTargetInput.value = dailyTarget;

    // Update the progress bar
    updateProgress(applicationCount, dailyTarget);

    if (applications.length === 0) {
      applicationsList.innerHTML = "<li>No applications tracked yet.</li>";
    } else {
      applicationsList.innerHTML = "";
      applications.forEach((app) => {
        const listItem = document.createElement("li");
        listItem.textContent = `URL: ${app.url} | Time: ${app.timestamp}`;
        applicationsList.appendChild(listItem);
      });
    }
  });

  setTargetButton.addEventListener("click", () => {
    const dailyTarget = parseInt(dailyTargetInput.value);
    if (!isNaN(dailyTarget) && dailyTarget > 0) {
      chrome.storage.sync.set({ dailyTarget }, () => {
        dailyTargetDisplay.textContent = dailyTarget;
        alert(`Daily target set to ${dailyTarget}`);
      });
    } else {
      alert("Please enter a valid target number.");
    }
  });
});
