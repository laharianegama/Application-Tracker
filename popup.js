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

  // Add these lines at the beginning of your existing popup.js file
  const openNotesBtn = document.getElementById("openNotesBtn");
  const notesModal = document.getElementById("notesModal");
  const notesText = document.getElementById("notesText");
  const saveNotesBtn = document.getElementById("saveNotesBtn");
  const closeNotesBtn = document.getElementById("closeNotesBtn");

  const confirmResetBtn = document.getElementById("confirmReset");
  const cancelResetBtn = document.getElementById("cancelReset");
  

  const networkingModal = document.getElementById('networkingModal');
  const openNetworkingBtn = document.getElementById('openNetworkingBtn');
  const closeNetworkingBtn = document.getElementById('closeNetworkingBtn');
  const tabBtns = document.querySelectorAll('.tab-btn');

  
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
    {
      quote: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
    },
    {
      quote: "Opportunities don't happen, you create them.",
      author: "Chris Grosser",
    },
    {
      quote: "Everything you’ve ever wanted is on the other side of fear.",
      author: "George Addair",
    },
    {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      quote: "Start where you are. Use what you have. Do what you can.",
      author: "Arthur Ashe",
    },
    {
      quote: "Success doesn’t come to you, you go to it.",
      author: "Marva Collins",
    },
    {
      quote:
        "It's not the load that breaks you down, it's the way you carry it.",
      author: "Lou Holtz",
    },
    {
      quote:
        "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
    },
    {
      quote:
        "I am not a product of my circumstances. I am a product of my decisions.",
      author: "Stephen Covey",
    },
    {
      quote: "What you do today can improve all your tomorrows.",
      author: "Ralph Marston",
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
      progressLabel.textContent = "Daily target achieved!🏆🎉";
    } else if (progress >= 0.8) {
      progressLabel.textContent = "Almost there! Keep pushing!🎯💪🏼";
    } else if (progress >= 0.5) {
      progressLabel.textContent = "Great job, you're halfway!🌓🌟";
    } else if (progress > 0) {
      progressLabel.textContent = "Keep going!🏃‍♂️⚡";
    } else {
      progressLabel.textContent = "Start applying! 🎬🌱";
    }
  }

  function checkAndResetDaily() {
    const today = new Date().toISOString().split('T')[0];
    chrome.storage.sync.get(['lastApplicationUpdateDate', 'applicationCount', 'dailyTarget', 'streak', 'targetMet'], (data) => {
      if (data.lastApplicationUpdateDate !== today) {
        // If yesterday's target was met, increment streak
        if (data.targetMet) {
          streak = (data.streak || 0) + 1;
        } else {
          streak = 0;
        }
        
        // Reset for new day
        applicationCount = 0;
        chrome.storage.sync.set({
          applicationCount,
          lastApplicationUpdateDate: today,
          streak,
          targetMet: false
        });
        
        progressCount.textContent = applicationCount;
        updateProgress();
        updateStreakText();
        chrome.action.setBadgeText({ text: applicationCount.toString() });
      } else {
        // Same day - restore previous values
        applicationCount = data.applicationCount || 0;
        streak = data.streak || 0;
      }
    });
  }

  function updateProgress() {
    const progress = Math.min(applicationCount / dailyTarget, 1);
    const circumference = 2 * Math.PI * 45; // Updated radius
    progressCircleFill.style.strokeDasharray = circumference;
    progressCircleFill.style.strokeDashoffset = circumference * (1 - progress);

    // Update progress circle appearance
    const progressCircle = document.querySelector(".progress-circle");
    const progressFill = document.querySelector(".progress-circle-fill");
    
    // Remove all progress-related classes
    progressCircle.classList.remove(
      "progress-near-complete",
      "progress-complete"
    );
    progressFill.classList.remove(
      "progress-low",
      "progress-medium",
      "progress-high"
    );

    // Add appropriate class based on progress
    if (progress >= 1) {
      progressCircle.classList.add("progress-complete");
      progressFill.classList.add("progress-high");
      if (applicationCount === dailyTarget) {
        createConfetti();
      }
    } else if (progress >= 0.8) {
      progressCircle.classList.add("progress-near-complete");
      progressFill.classList.add("progress-high");
    } else if (progress >= 0.5) {
      progressFill.classList.add("progress-medium");
    } else {
      progressFill.classList.add("progress-low");
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

    updateStreakText();

    // Update badge on the extension icon
    chrome.action.setBadgeText({ text: applicationCount.toString() });
  }

  function updateDailyQuote() {
    const { quote, author } = getQuoteOfTheDay();
    dailyQuote.textContent = `"${quote}"`;
    quoteAuthor.textContent = `- ${author}`;
  }

  // Add this function to load existing notes
  function loadNotes() {
    chrome.storage.sync.get(["notes"], (data) => {
      if (data.notes) {
        notesText.value = data.notes;
      }
    });
  }

  function updateStreakText() {
    if (streak > 0) {
      streakText.textContent = `You're on a ${streak}-day streak! 🔥`;
    } else {
      streakText.textContent = `Start your streak today! 💪`;
    }
  }

  incrementButton.addEventListener("click", () => {
    applicationCount++;
    totalApplications++;
    
    // Check if daily target is met
    const targetMet = applicationCount >= dailyTarget;
    
    chrome.storage.sync.set({
      applicationCount,
      totalApplications,
      lastApplicationUpdateDate: new Date().toISOString().split('T')[0],
      targetMet
    });
    
    progressCount.textContent = applicationCount;
    totalApplicationsDisplay.textContent = totalApplications;
    updateProgress();
    chrome.action.setBadgeText({ text: applicationCount.toString() });
  });

  resetButton.addEventListener("click", () => {
    confirmationModal.style.display = "block";
  });

  confirmResetBtn.addEventListener("click", () => {
    applicationCount = 0;
    chrome.storage.sync.set({ applications: applicationCount }, () => {
      updateProgress();
      confirmationModal.style.display = "none";
    });
  });

  cancelResetBtn.addEventListener("click", () => {
    confirmationModal.style.display = "none";
  });

  setTargetButton.addEventListener("click", () => {
    const newTarget = parseInt(dailyTargetInput.value);
    if (newTarget > 0) {
      dailyTarget = newTarget;
      chrome.storage.sync.set({ dailyTarget }, updateProgress);
    }
  });

  // Networking modal controls
  openNetworkingBtn.addEventListener('click', async () => {
    networkingModal.style.display = 'block';
    if (networkingManager) {
      await networkingManager.refreshContactsList();
      await networkingManager.refreshTemplatesList();
    }
  });

  closeNetworkingBtn.addEventListener('click', () => {
    networkingModal.style.display = 'none';
  });

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');

      if (btn.dataset.tab === 'contacts' && networkingManager) {
        await networkingManager.refreshContactsList();
      } else if (btn.dataset.tab === 'templates' && networkingManager) {
        await networkingManager.refreshTemplatesList();
      }
    });
  });

  openNotesBtn.addEventListener("click", () => {
    notesModal.style.display = "block";
    loadNotes();
  });

  saveNotesBtn.addEventListener("click", () => {
    const notes = notesText.value;
    chrome.storage.sync.set({ notes }, () => {
      console.log("Notes saved");
      notesModal.style.display = "none";
    });
  });

  closeNotesBtn.addEventListener("click", () => {
    notesModal.style.display = "none";
  });

  // Close the modal if the user clicks outside of it
  window.addEventListener("click", (event) => {
    if (event.target === notesModal) {
      notesModal.style.display = "none";
    }
    if (event.target === confirmationModal) {
      confirmationModal.style.display = "none";
    }
  });

  // Initialize progress from storage
  chrome.storage.sync.get(['applicationCount', 'dailyTarget', 'streak', 'lastApplicationUpdateDate', 'totalApplications'], (data) => {
    // Initialize values from storage
    applicationCount = data.applicationCount || 0;
    dailyTarget = data.dailyTarget || 10;
    streak = data.streak || 0;
    totalApplications = data.totalApplications || 0;

    // Check for daily reset first
    checkAndResetDaily();
    
    // Then update UI
    updateProgress();
    updateDailyQuote();
    loadNotes();
    
    // Update displays
    progressCount.textContent = applicationCount;
    dailyTargetDisplay.textContent = dailyTarget;
    totalApplicationsDisplay.textContent = totalApplications;
    updateStreakText();
    });
});
