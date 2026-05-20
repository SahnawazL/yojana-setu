// api/chat.js — Vercel Serverless Function
// Proxies Groq API calls server-side so the key is NEVER exposed in the browser bundle.
// Deploy this file at the root of your project as: /api/chat.js

export default async function handler(req, res) {
  // ── Only allow POST ────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const apiKey = process.env.GROQ_API_KEY; // ← server-side only, never exposed

  if (!apiKey) {
    console.error("[YojanaSetu] GROQ_API_KEY is not set in Vercel env variables.");
    return res.status(500).json({ error: { message: "Server configuration error: API key missing." } });
  }

  const { messages, model, max_tokens, temperature } = req.body;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ messages, model, max_tokens, temperature }),
    });

    const data = await groqRes.json();

    // Forward Groq's status code (401, 429, 500, etc.) back to client
    return res.status(groqRes.status).json(data);

  } catch (err) {
    console.error("[YojanaSetu] Groq proxy error:", err.message);
    return res.status(502).json({ error: { message: "Failed to reach Groq API. Try again." } });
  }
}
