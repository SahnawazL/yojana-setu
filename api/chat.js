// api/chat.js — Vercel Serverless Function (CommonJS)
const https = require("https");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: "GROQ_API_KEY not set on server." } });
  }

  const { messages, model, max_tokens, temperature } = req.body;
  const payload = JSON.stringify({ messages, model, max_tokens, temperature });

  return new Promise((resolve) => {
    const options = {
      hostname: "api.groq.com",
      path:     "/openai/v1/chat/completions",
      method:   "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const request = https.request(options, (groqRes) => {
      let data = "";
      groqRes.on("data", chunk => { data += chunk; });
      groqRes.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          res.status(groqRes.statusCode).json(parsed);
        } catch {
          res.status(502).json({ error: { message: "Invalid response from Groq." } });
        }
        resolve();
      });
    });

    request.on("error", (err) => {
      res.status(502).json({ error: { message: err.message } });
      resolve();
    });

    request.write(payload);
    request.end();
  });
};
