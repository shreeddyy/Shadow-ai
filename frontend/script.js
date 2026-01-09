// ===== Shadow AI Frontend Logic =====

// Elements
const emotionButtons = document.querySelectorAll(".emotion");
const analyzeButton = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("result");
const decisionInput = document.getElementById("decisionInput");

// State
let currentEmotion = "Neutral";

// -----------------------------
// Emotion selection handling
// -----------------------------
emotionButtons.forEach(button => {
  button.addEventListener("click", () => {
    // Remove active state from all buttons
    emotionButtons.forEach(btn => btn.classList.remove("active"));

    // Activate selected emotion
    button.classList.add("active");
    currentEmotion = button.dataset.emotion;
  });
});

// -----------------------------
// Analyze decision
// -----------------------------
analyzeButton.addEventListener("click", async () => {
  const decisionText = decisionInput.value.trim();

  if (!decisionText) {
    alert("Please write your decision before analyzing.");
    return;
  }

  // Show thinking state
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = "🧠 Shadow AI is thinking calmly...";

  try {
    const response = await fetch("https://shadow-ai-qauz.onrender.com/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: decisionText,
        emotion: currentEmotion
      })
    });

    if (!response.ok) {
      throw new Error("Backend did not respond properly");
    }

    const data = await response.json();

    // Display result in a human-friendly way
    resultBox.innerHTML = `
      <strong>⚠️ Risk:</strong><br/>
      ${data.risk}<br/><br/>

      <strong>🧩 Analysis:</strong><br/>
      ${data.analysis}<br/><br/>

      <strong>💡 Advice:</strong><br/>
      ${data.suggestion}
    `;
  } catch (error) {
    console.error("Frontend Error:", error);
    resultBox.innerHTML =
      "⚠️ Something went wrong. Please make sure the backend is running and try again.";
  }
});

