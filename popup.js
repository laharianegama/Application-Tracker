// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const applicationsList = document.getElementById("applicationsList");
  const totalCount = document.getElementById("totalCount");

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
});
