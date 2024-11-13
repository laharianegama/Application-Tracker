// widget.js

// Make the widget draggable
let isDragging = false;
const widget = document.getElementById("floating-widget");

widget.addEventListener("mousedown", (event) => {
  isDragging = true;
  document.addEventListener("mousemove", onMouseMove);
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  document.removeEventListener("mousemove", onMouseMove);
});

function onMouseMove(event) {
  if (isDragging) {
    widget.style.left = `${event.pageX - 25}px`;
    widget.style.top = `${event.pageY - 25}px`;
  }
}

// Update the widget with application count
chrome.storage.sync.get(["applications"], (data) => {
  const applicationCount = (data.applications || []).length;
  const widgetCounter = document.getElementById("widget-counter");
  if (widgetCounter) {
    widgetCounter.textContent = applicationCount;
  }
});

// Listen for storage changes to update the widget dynamically
chrome.storage.onChanged.addListener((changes) => {
  if (changes.applications) {
    const widgetCounter = document.getElementById("widget-counter");
    if (widgetCounter) {
      widgetCounter.textContent = changes.applications.newValue.length;
    }
  }
});
