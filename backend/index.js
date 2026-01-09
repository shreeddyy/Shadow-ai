import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check (IMPORTANT)
app.get("/", (req, res) => {
  res.send("✅ Shadow AI backend is running");
});

app.post("/analyze", async (req, res) => {
  try {
    const { decision, emotion } = req.body;

    if (!decision) {
      return res.status(400).json({ error: "Decision missing" });
    }

    const prompt = `
You are Shadow AI.

Decision: ${decision}
Emotion: ${emotion || "Neutral"}

Reply in simple plain text with:
Risk:
Analysis:
Advice:
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );


const data = await response.json();

console.log("Gemini raw response:", JSON.stringify(data, null, 2));

let text = "No response from AI.";

if (data?.candidates?.length > 0) {
  const parts = data.candidates[0].content?.parts;
  if (parts && parts.length > 0) {
    text = parts.map(p => p.text).join("\n");
  }
}

res.json({
  risk: "See analysis below",
  analysis: text,
  suggestion: "Reflect calmly before deciding"
});
;

    res.json({
      risk: "See analysis below",
      analysis: text,
      suggestion: "Reflect calmly before deciding"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

