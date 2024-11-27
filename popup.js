document.addEventListener("DOMContentLoaded", () => {
  const progressCount = document.getElementById("progressCount");
  const dailyTargetDisplay = document.getElementById("dailyTargetDisplay");
  const motivationalText = document.getElementById("motivationalText");
  const incrementButton = document.getElementById("incrementButton");
  const resetButton = document.getElementById("resetButton");
  const dailyTargetInput = document.getElementById("dailyTarget");
  const setTargetButton = document.getElementById("setTarget");
  const progressCircleFill = document.querySelector(".progress-circle-fill");

  let applicationCount = 0;
  let dailyTarget = 10;

  // Helper function to update the progress
  function updateProgress() {
    const progress = Math.min(applicationCount / dailyTarget, 1);
    const circumference = 2 * Math.PI * 40; // Radius of 40
    progressCircleFill.style.strokeDasharray = circumference;
    progressCircleFill.style.strokeDashoffset = circumference * (1 - progress);

    progressCount.textContent = applicationCount;
    dailyTargetDisplay.textContent = dailyTarget;

    if (applicationCount >= dailyTarget) {
      motivationalText.textContent = "Goal achieved! 🎉";
    } else if (applicationCount > 0) {
      motivationalText.textContent = "Keep going! You're doing great!";
    } else {
      motivationalText.textContent =
        "Let's get started! Apply for your first job today.";
    }
  }

  // Increment application count
  incrementButton.addEventListener("click", () => {
    applicationCount++;
    chrome.storage.sync.set({ applications: applicationCount }, () => {
      updateProgress();
    });
  });

  // Reset application count
  resetButton.addEventListener("click", () => {
    applicationCount = 0;
    chrome.storage.sync.set({ applications: applicationCount }, () => {
      updateProgress();
    });
  });

  // Set daily target
  setTargetButton.addEventListener("click", () => {
    const newTarget = parseInt(dailyTargetInput.value);
    if (newTarget > 0) {
      dailyTarget = newTarget;
      chrome.storage.sync.set({ dailyTarget: dailyTarget }, () => {
        updateProgress();
      });
    }
  });

  // Initialize progress from storage
  chrome.storage.sync.get(["applications", "dailyTarget"], (data) => {
    applicationCount = data.applications || 0;
    dailyTarget = data.dailyTarget || 10;
    updateProgress();
  });
});
