# Jake's Resume Tailor — Setup Guide

This folder is a complete, ready-to-deploy web app. Once it's live, Jake opens one link, pastes a job
posting, and gets his resume reworded to match it (downloadable as Word/PDF), plus a "skills you already
have" box. His real resume is locked in — the app only rewords his existing bullets, never invents anything.

You'll do this **once**, in about 15–20 minutes. Three accounts, all free to create:
**GitHub** (stores the code), **Vercel** (puts it online), and **Anthropic** (the AI that does the rewriting).

---

## What's in this folder
- `index.html` — the web page Jake sees
- `api/tailor.js` — the secure backend that talks to Claude (your API key lives here, never in the browser)
- `package.json` — basic config
- `README.md` — this guide

> Keep the `api` folder exactly where it is. The app won't work if `tailor.js` isn't inside an `api` folder.

---

## STEP 1 — Get a Claude API key (~3 min)
1. Go to **https://console.anthropic.com** and sign up / log in.
2. Add a payment method under **Billing**. Usage for this tool is tiny — a few cents per resume.
3. **Set a spend limit** (recommended): Billing → **Limits** → set a low monthly cap (e.g. $5). This protects you since the app link is open.
4. Go to **API Keys** → **Create Key** → copy the key (starts with `sk-ant-...`). Paste it somewhere safe for Step 3. You won't be able to see it again.

## STEP 2 — Put the code on GitHub (~5 min)
1. Go to **https://github.com** and sign up / log in.
2. Click **New** (or the **+** top-right → New repository).
3. Name it `jake-resume-tailor`, leave it **Public** or Private (either works), click **Create repository**.
4. On the next page click **uploading an existing file**.
5. Drag in **all the contents of this folder** — `index.html`, `package.json`, and the **`api` folder** (with `tailor.js` inside it). Make sure the `api` folder comes along.
6. Click **Commit changes**.

## STEP 3 — Put it online with Vercel (~5 min)
1. Go to **https://vercel.com** → **Sign Up** → choose **Continue with GitHub** (easiest).
2. Click **Add New… → Project**.
3. Find `jake-resume-tailor` in the list and click **Import**.
4. Before clicking Deploy, open **Environment Variables** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste the key from Step 1
   - Click **Add**.
5. Click **Deploy**. Wait about a minute.
6. You'll get a live link like `https://jake-resume-tailor.vercel.app`. **That's the link to send Jake.**

## STEP 4 — Test it
Open the link, paste a real job description, and click **Tailor my resume**. You should see the progress
animation, then the reworded resume + fit box. Download the Word file to confirm it looks right.

---

## Everyday use (for Jake)
1. Open the link.
2. Paste the full job description into the box (the link field is optional).
3. Click **Tailor my resume** and wait for the progress bar.
4. Review the highlighted keywords (highlighting is on-screen only — downloads are clean).
5. Click **Download Word** or **Save as PDF** and submit.

## Good to know
- **It's currently open** (no password). Anyone with the link can use it and consume API credits — the spend cap from Step 1 is your safety net. Want a password later? It's a 2-minute change; just ask.
- **To edit anything** (his resume content, wording rules, the model): change the files on GitHub and Vercel automatically re-deploys in ~1 minute.
- **The downloaded `.doc`** faithfully matches his template but is HTML-based Word. It opens cleanly in Word; if you ever want a byte-perfect version from his original `.docx`, send the output over and it can be hand-finished.
- **Model:** uses `claude-sonnet-4-6` for quality. To cut cost further you can switch to a smaller model in `api/tailor.js` (one line).
