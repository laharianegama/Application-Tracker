document.addEventListener("DOMContentLoaded", () => {
  const progressCount = document.getElementById("progressCount");
  const dailyTargetDisplay = document.getElementById("dailyTargetDisplay");
  const motivationalText = document.getElementById("motivationalText");
  const streakText = document.getElementById("streakText");
  const incrementButton = document.getElementById("incrementButton");
  const resetButton = document.getElementById("resetButton");
  const dailyTargetInput = document.getElementById("dailyTarget");
  const setTargetButton = document.getElementById("setTarget");
  const progressCircleFill = document.querySelector(".progress-circle-fill");

  let applicationCount = 0;
  let dailyTarget = 10;
  let streak = 0;
  let lastUpdatedDate = null;

  function updateProgress() {
    const progress = Math.min(applicationCount / dailyTarget, 1);
    const circumference = 2 * Math.PI * 40; // Circle radius: 40
    progressCircleFill.style.strokeDasharray = circumference;
    progressCircleFill.style.strokeDashoffset = circumference * (1 - progress);

    progressCount.textContent = applicationCount;
    dailyTargetDisplay.textContent = dailyTarget;

    // Motivational messages
    if (applicationCount >= dailyTarget) {
      motivationalText.textContent = "Goal achieved! 🎉";
    } else if (applicationCount > 0) {
      motivationalText.textContent = "Keep going! You're doing great!";
    } else {
      motivationalText.textContent =
        "Let's get started! Apply for your first job today.";
    }

    // Update streak
    const today = new Date().toISOString().split("T")[0];
    if (applicationCount >= dailyTarget && lastUpdatedDate !== today) {
      streak++;
      lastUpdatedDate = today;
      chrome.storage.sync.set({ streak, lastUpdatedDate });
    }
    streakText.textContent = `You're on a ${streak}-day streak!`;

    // Update badge on the extension icon
    chrome.action.setBadgeText({ text: applicationCount.toString() });
  }

  incrementButton.addEventListener("click", () => {
    applicationCount++;
    chrome.storage.sync.set({ applications: applicationCount }, updateProgress);
  });

  resetButton.addEventListener("click", () => {
    applicationCount = 0;
    chrome.storage.sync.set({ applications: applicationCount }, updateProgress);
  });

  setTargetButton.addEventListener("click", () => {
    const newTarget = parseInt(dailyTargetInput.value);
    if (newTarget > 0) {
      dailyTarget = newTarget;
      chrome.storage.sync.set({ dailyTarget }, updateProgress);
    }
  });

  // Initialize progress from storage
  chrome.storage.sync.get(
    ["applications", "dailyTarget", "streak", "lastUpdatedDate"],
    (data) => {
      applicationCount = data.applications || 0;
      dailyTarget = data.dailyTarget || 10;
      streak = data.streak || 0;
      lastUpdatedDate = data.lastUpdatedDate || null;
      updateProgress();
    }
  );
});
