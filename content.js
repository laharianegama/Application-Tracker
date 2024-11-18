(() => {
  console.log("Content script loaded");

  const applicationButtonKeywords = [
    "Submit Application",
    "Apply Now",
    "Submit",
    "Send Application",
    "Apply",
    "Finish Application",
    "Submit your application",
  ];

  // Function to monitor button clicks
  function trackApplicationButtonClick() {
    const buttons = document.querySelectorAll("button, input[type='submit']");
    console.log("Detected buttons:", buttons);

    buttons.forEach((button) => {
      const buttonText = button.innerText || button.value || "";
      const nestedSpanText = button.querySelector("span")?.innerText || "";

      if (
        applicationButtonKeywords.some(
          (keyword) =>
            buttonText.includes(keyword) || nestedSpanText.includes(keyword)
        )
      ) {
        console.log("Found a button with matching text:", buttonText);

        button.addEventListener("click", () => {
          console.log("Application submit button clicked");

          // Attempt to update storage with error handling
          try {
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
          } catch (error) {
            console.error("Failed to set applicationSubmitted flag:", error);
          }
        });
      }
    });
  }

  // Run the function after the page loads
  window.addEventListener("load", trackApplicationButtonClick);
})();
