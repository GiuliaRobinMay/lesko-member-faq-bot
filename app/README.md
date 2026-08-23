# Lesko Help Navigator — member FAQ & navigation bot (v1 draft)

Signposting bot: points members to the right lesson, quick guide, PDF or live
event, and shows a summary inline. It does NOT generate grant lists — that is
the AI Grant Researcher's job, and the bot links to it.

## Files
- `index.html` + `data.js` + `app.js` — the working app (dev version)
- `lesko-navigator.html` — single-file build, this is what gets published
- rebuild the single file after editing:
  `python3 -c "..."` — see repo history, or just re-inline data.js/app.js

## Data sources (all generated, not hand-written)
- `kb/knowledge-base.yaml` — 17 FAQ answers, with inside/outside variants
- `kb/quickguides/guides.json` — 81 quick guides, 627 resources
- `kb/structure/content-index.json` — 49 spaces, 112 lessons, 103 hosted PDFs
- `kb/apps/apps.json` — roadmap, onboarding, call sheet, follow-up apps

## Parked for later (agreed with Giulia)
- Screen recordings → step-by-step SOPs for: complete profile, download app,
  adjust notifications, quick tour
- Purchase flow repo — onboarding flow changes + cancel via ClickBank/PayPal
- Login / lost password deep dive
- Webinar transcript + video once recorded
- Recurring accuracy check (link validation on a schedule)
- Per-space "what this tab is for" briefs — one at a time with Giulia
