// content.js

console.log("Content script loaded");

// Define common phrases for job application buttons
const applicationButtonKeywords = [
  "Submit Application",
  "Apply Now",
  "Submit",
  "Send Application",
  "Apply",
  "Finish Application",
];

// Function to monitor button clicks
function trackApplicationButtonClick() {
  const buttons = document.querySelectorAll("button, input[type='submit']");
  console.log("Detected buttons:", buttons);

  buttons.forEach((button) => {
    const buttonText = button.innerText || button.value;

    if (
      applicationButtonKeywords.some((keyword) => buttonText.includes(keyword))
    ) {
      console.log("Found a button with matching text:", buttonText);
      button.addEventListener("click", () => {
        console.log("Application submit button clicked");

        // Send a message to the background script to handle storage
        chrome.runtime.sendMessage({ type: "application_submit" }, () => {
          console.log("Sent application_submit message to background script.");
        });
      });
    }
  });
}

// Run the function after the page loads
window.addEventListener("load", trackApplicationButtonClick);
