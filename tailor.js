// Secure serverless backend for Jake's Resume Tailor.
// Runs on Vercel. Holds the Claude API key server-side (never exposed to the browser).
// The browser POSTs { jobText, editable } here; this calls Claude and returns the tailored JSON.

function buildPrompt(jobText, editable) {
  return [
    "You are an expert finance-industry resume editor and ATS-optimization specialist.",
    "You are tailoring ONE candidate's resume (Jake Sobieski, CFA) to ONE job posting.",
    "You are given his real resume bullets as JSON (array of {id, text}) plus his skills line (id 'skills').",
    "",
    "ABSOLUTE RULES:",
    "1. Only reword the text of the items provided. NEVER invent experience, employers, titles, dates, deal sizes, numbers, tools, or certifications. Every figure (100+, $450M, $210M, 5 scenario, 3.81, etc.) must remain exactly as given.",
    "2. Reword to mirror the posting's language and weave in its exact keywords/phrases ONLY where they truthfully describe what the bullet already says. This is to pass ATS keyword scans.",
    "3. Keep each rewritten item within ~15% of the original length — this resume must stay one page.",
    "4. For the 'skills' line: you may reorder and lightly rephrase the SAME tools/skills to surface the ones the posting emphasizes first. Do not add tools he didn't list.",
    "",
    "Return ONLY valid JSON (no markdown fences), with this exact shape:",
    '{ "rewrites":[{"id":"c1","text":"..."}, ...], "skills":"reworded skills line", "keywords_added":["kw1","kw2"], "fit":[{"skill":"short name from posting","why":"1 sentence tying it to his REAL experience"}] }',
    "Include a rewrite for every id you change (omit ids you leave unchanged). Provide 4-6 'fit' items — the strongest genuine matches.",
    "",
    "EDITABLE RESUME ITEMS (JSON):",
    JSON.stringify(editable),
    "",
    "THE JOB POSTING:",
    jobText
  ].join("\n");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY. Add it in Vercel → Settings → Environment Variables, then redeploy." }); return; }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const jobText = (body.jobText || "").trim();
    const editable = body.editable || [];
    if (jobText.length < 40) { res.status(400).json({ error: "Job description too short." }); return; }

    const aiResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2500,
        messages: [{ role: "user", content: buildPrompt(jobText, editable) }]
      })
    });

    const data = await aiResp.json();
    if (data.error) { res.status(502).json({ error: data.error.message || "AI request failed." }); return; }

    let txt = (data.content && data.content[0] && data.content[0].text) || "";
    txt = txt.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/, "").trim();
    const a = txt.indexOf("{"), b = txt.lastIndexOf("}");
    if (a >= 0 && b > a) txt = txt.slice(a, b + 1);

    const parsed = JSON.parse(txt);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: "Tailoring failed: " + (e && e.message ? e.message : String(e)) });
  }
};
