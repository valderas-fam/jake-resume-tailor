// Sends Jake's follow-up REMINDER emails to his own inbox via Resend.
// Called by the daily Cowork scheduled task with JSON { to, subject, body }.
// The Resend API key lives in Vercel env (RESEND_API_KEY) — never in the browser or the task.

const ALLOWED_TO = "jake6sobi@gmail.com";

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }

  const key = process.env.RESEND_API_KEY;
  if (!key) { res.status(500).json({ error: "Server missing RESEND_API_KEY. Add it in Vercel → Settings → Environment Variables, then redeploy." }); return; }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const to = (body.to || ALLOWED_TO).trim();
    const subject = (body.subject || "Job follow-up reminder").trim();
    const text = (body.body || "").trim();

    // Safety: this endpoint is public, so it may ONLY email Jake — it can't be abused to spam others.
    if (to !== ALLOWED_TO) { res.status(403).json({ error: "This endpoint can only send to " + ALLOWED_TO }); return; }
    if (!text) { res.status(400).json({ error: "Empty reminder body." }); return; }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": "Bearer " + key },
      body: JSON.stringify({
        from: "Jake's Job Search <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        text: text
      })
    });

    const data = await r.json();
    if (!r.ok) { res.status(502).json({ error: (data && data.message) || "Resend send failed", detail: data }); return; }
    res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    res.status(500).json({ error: "Send failed: " + (e && e.message ? e.message : String(e)) });
  }
};
