(() => {
  console.log("Content script loaded");

  const applicationButtonKeywords = [
    "Submit Application",
    "Apply Now",
    "Submit",
    "Send Application",
    "Finish Application",
    "Submit your application",
  ];

  const trackedButtons = new WeakSet();

  // Function to detect and process buttons
  function trackApplicationButtonClick() {
    const buttons = document.querySelectorAll(
      "button, input[type='submit'], [role='button']"
    );
    console.log("Detected buttons:", buttons);

    buttons.forEach((button) => {
      if (trackedButtons.has(button)) return; // Skip already tracked buttons

      const buttonText = button.innerText || button.value || "";
      const nestedSpanText = button.querySelector("span")?.innerText || "";

      // Check if button matches any keyword
      if (
        applicationButtonKeywords.some(
          (keyword) =>
            buttonText.includes(keyword) || nestedSpanText.includes(keyword)
        )
      ) {
        console.log("Found a button with matching text:", buttonText);

        // Use event delegation to ensure clicks are captured even if the button is removed
        button.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent any interference from page-level handlers
          console.log("Application submit button clicked");

          // Update storage
          chrome.storage.sync.set({ applicationSubmitted: true }, () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error setting applicationSubmitted flag:",
                chrome.runtime.lastError.message
              );
            } else {
              console.log("Set applicationSubmitted flag in storage.");
            }
          });
        });

        trackedButtons.add(button); // Mark button as tracked
      }
    });
  }

  // Debounce function for optimizing MutationObserver
  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Observe DOM for dynamically added or changed content
  const observer = new MutationObserver(
    debounce((mutationsList) => {
      for (const mutation of mutationsList) {
        // Only reprocess if new nodes are added
        if (mutation.addedNodes.length > 0) {
          console.log("DOM changed, running button tracking again");
          trackApplicationButtonClick();
        }
      }
    }, 300) // Debounce delay
  );

  observer.observe(document.body, { childList: true, subtree: true });

  // Run initially for already existing buttons
  trackApplicationButtonClick();
})();
