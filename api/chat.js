// api/chat.js — Vercel Serverless Function
// Node 24 supports native fetch — much simpler and more reliable than https module

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[YojanaSetu] GROQ_API_KEY is not set in Vercel Environment Variables!");
    return res.status(500).json({
      error: { message: "GROQ_API_KEY is not configured on the server. Please add it in Vercel → Settings → Environment Variables." }
    });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body), // Vercel auto-parses JSON body
    });

    const data = await groqRes.json();
    return res.status(groqRes.status).json(data);

  } catch (err) {
    console.error("[YojanaSetu] Groq fetch error:", err.message);
    return res.status(502).json({ error: { message: `Could not reach Groq API: ${err.message}` } });
  }
};
