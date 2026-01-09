import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ MIDDLEWARE (VERY IMPORTANT)
app.use(cors());
app.use(express.json());

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("✅ Shadow AI backend is running");
});

// ✅ ANALYZE ROUTE
app.post("/analyze", async (req, res) => {
  try {
    const { decision, emotion } = req.body;

    if (!decision) {
      return res.status(400).json({ error: "Decision is required" });
    }

    const prompt = `
You are Shadow AI, an intelligent decision assistant.

Decision: ${decision}
Emotion: ${emotion || "Neutral"}

Reply clearly in this format:
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

    // ✅ DEFAULT FALLBACK (GUARANTEED OUTPUT)
    let aiText = `
Risk:
This decision involves uncertainty and emotional factors.

Analysis:
You may be feeling pressure or confusion while making this choice.
Such situations often benefit from slowing down and examining all options logically.

Advice:
Pause, write down pros and cons, and avoid making impulsive decisions.
If possible, consult someone you trust before proceeding.
`;

    // ✅ USE GEMINI RESPONSE IF AVAILABLE
    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0].content?.parts;
      if (parts && parts.length > 0) {
        aiText = parts.map(p => p.text).join("\n");
      }
    }

    // ✅ SEND RESPONSE ONCE
    res.json({
      risk: "See analysis below",
      analysis: aiText,
      suggestion: "Reflect calmly before deciding"
    });

  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
