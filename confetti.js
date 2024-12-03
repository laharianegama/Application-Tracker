function createConfetti() {
  const colors = ["#4CAF50", "#FFC107", "#2196F3", "#FF5722", "#9C27B0"];
  const confettiCount = 100;
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}%;
        opacity: ${Math.random() + 0.5};
        transform: rotate(${Math.random() * 360}deg);
        pointer-events: none;
      `;

    container.appendChild(confetti);

    const animation = confetti.animate(
      [
        {
          transform: `translate(0, 0) rotate(0deg)`,
          opacity: 1,
        },
        {
          transform: `translate(${Math.random() * 200 - 100}px, ${
            window.innerHeight
          }px) rotate(${Math.random() * 720}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: Math.random() * 2000 + 1000,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }
    );

    animation.onfinish = () => container.removeChild(confetti);
  }

  setTimeout(() => document.body.removeChild(container), 3000);
}
