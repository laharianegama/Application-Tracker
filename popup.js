document.addEventListener("DOMContentLoaded", () => {
  const progressCount = document.getElementById("progressCount");
  const dailyTargetDisplay = document.getElementById("dailyTargetDisplay");
  const streakText = document.getElementById("streakText");
  const incrementButton = document.getElementById("incrementButton");
  const resetButton = document.getElementById("resetButton");
  const dailyTargetInput = document.getElementById("dailyTarget");
  const setTargetButton = document.getElementById("setTarget");
  const progressCircleFill = document.querySelector(".progress-circle-fill");
  const totalApplicationsDisplay = document.getElementById("totalApplications");
  const progressLabel = document.getElementById("progressLabel");
  const dailyQuote = document.getElementById("dailyQuote");
  const quoteAuthor = document.getElementById("quoteAuthor");

  let applicationCount = 0;
  let dailyTarget = 10;
  let streak = 0;
  let lastUpdatedDate = null;
  let totalApplications = 0;

  const quotes = [
    {
      quote: "The future depends on what you do today.",
      author: "Mahatma Gandhi",
    },
    {
      quote:
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
    },
    {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      quote: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
    },
    {
      quote:
        "The only place where success comes before work is in the dictionary.",
      author: "Vidal Sassoon",
    },
    {
      quote: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
    },
    {
      quote: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
    },
  ];

  function getQuoteOfTheDay() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return quotes[dayOfYear % quotes.length];
  }

  function updateProgressLabel(progress) {
    if (progress >= 1) {
      progressLabel.textContent = "Goal achieved! 🎉";
    } else if (progress >= 0.8) {
      progressLabel.textContent = "Almost there!";
    } else if (progress >= 0.5) {
      progressLabel.textContent = "Halfway there!";
    } else if (progress > 0) {
      progressLabel.textContent = "Keep going!";
    } else {
      progressLabel.textContent = "Start applying!";
    }
  }

  function updateProgress() {
    const progress = Math.min(applicationCount / dailyTarget, 1);
    const circumference = 2 * Math.PI * 45; // Updated radius
    progressCircleFill.style.strokeDasharray = circumference;
    progressCircleFill.style.strokeDashoffset = circumference * (1 - progress);

    // Update progress circle appearance
    const progressCircle = document.querySelector(".progress-circle");
    progressCircle.classList.remove(
      "progress-near-complete",
      "progress-complete"
    );
    if (progress >= 1) {
      progressCircle.classList.add("progress-complete");
    } else if (progress >= 0.8) {
      progressCircle.classList.add("progress-near-complete");
    }

    // Add animation
    progressCircle.classList.add("progress-update");
    setTimeout(() => progressCircle.classList.remove("progress-update"), 500);

    progressCount.textContent = applicationCount;
    dailyTargetDisplay.textContent = dailyTarget;
    totalApplicationsDisplay.textContent = totalApplications;
    updateProgressLabel(progress);

    // Update streak with proper handling of missed days
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    if (applicationCount >= dailyTarget) {
      if (lastUpdatedDate === yesterday) {
        streak++;
      } else if (lastUpdatedDate !== today) {
        streak = 1;
      }
      lastUpdatedDate = today;
      chrome.storage.sync.set({ streak, lastUpdatedDate });
    } else if (lastUpdatedDate !== today && lastUpdatedDate !== yesterday) {
      streak = 0;
      chrome.storage.sync.set({ streak, lastUpdatedDate });
    }

    streakText.textContent = `You're on a ${streak}-day streak! 🔥`;

    // Update badge on the extension icon
    chrome.action.setBadgeText({ text: applicationCount.toString() });
  }

  function updateDailyQuote() {
    const { quote, author } = getQuoteOfTheDay();
    dailyQuote.textContent = `"${quote}"`;
    quoteAuthor.textContent = `- ${author}`;
  }

  incrementButton.addEventListener("click", () => {
    applicationCount++;
    totalApplications++;
    chrome.storage.sync.set(
      {
        applications: applicationCount,
        totalApplications: totalApplications,
      },
      updateProgress
    );
  });

  resetButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset today's progress?")) {
      applicationCount = 0;
      chrome.storage.sync.set(
        { applications: applicationCount },
        updateProgress
      );
    }
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
    [
      "applications",
      "dailyTarget",
      "streak",
      "lastUpdatedDate",
      "totalApplications",
    ],
    (data) => {
      applicationCount = data.applications || 0;
      dailyTarget = data.dailyTarget || 10;
      streak = data.streak || 0;
      lastUpdatedDate = data.lastUpdatedDate || null;
      totalApplications = data.totalApplications || 0;
      updateProgress();
      updateDailyQuote();
    }
  );
});
