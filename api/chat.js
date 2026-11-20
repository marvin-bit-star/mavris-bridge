export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const ghKey = body.gh_key || "";
    const messages = body.messages || [];

    if (!messages.length) {
      return res.status(200).json({ status: "VERCEL_BRIDGE_OK" });
    }

    const endpoints = [
      { url: "https://github.ai", key: ghKey, model: "openai/gpt-4o-mini" },
      { url: "https://azure.com", key: ghKey, model: "gpt-4o-mini" },
      { url: "https://siliconflow.cn", key: "sk-yseefazaxnqutucnzyohkjpgtlkfiioxddejhlzkfugkcpau", model: "Qwen/Qwen2.5-7B-Instruct" }
    ];

    for (const ep of endpoints) {
      if (!ep.key || ep.key.startsWith("__")) continue;
      try {
        const r = await fetch(ep.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + ep.key },
          body: JSON.stringify({ model: ep.model, messages: messages })
        });
        const text = await r.text();
        if (r.ok && text.includes("choices")) {
          return res.status(200).send(text);
        }
      } catch (e) {}
    }

    return res.status(502).json({ error: "all_failed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
