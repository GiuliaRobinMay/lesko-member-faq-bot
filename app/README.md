# Lesko Help Navigator — member FAQ & navigation bot (v1 draft)

Signposting bot: points members to the right lesson, quick guide, PDF or live
event, and shows a summary inline. It does NOT generate grant lists — that is
the AI Grant Researcher's job, and the bot links to it.

## The one rule
The bot never hands out an outside phone number, email or website — no 211, no
agency contact lists. Every subject question is answered by naming the **event
to attend** and the **place inside the community** that covers it. The quick
guides and the AI Search hold the contacts; the bot hands you the guide.

Routing (`ROUTES` in `app.js`, confirmed by Giulia):

| Member asks about | Sent to |
|---|---|
| Where can I ask / talk to someone | Member Q&A · Mid Mondays Q&A · Thursday Drop-In Clinic |
| Finding their way around | Welcome Tour (daily) · Open Office with Tony |
| Subscription problems | Questions Channel · Open Office with Tony |
| Their grants | Member Q&A · Thursday Drop-In Clinic (all day) |
| AI | AI User Skills with Roger · AI Workshop |
| Business | Starting & Re-Starting a Business · Business Series Saturdays · Business Growth with Amber |
| Nonprofit | Start a Nonprofit with Megan |
| Anything general / unplaceable | Matthew Meetup |

## Every subject answer names three things
Classes, **lessons** and **quick guides** — never just one of the three.

- **Classes** — from the events calendar, per the routing table above.
- **Lessons** — 88 community lessons across 9 spaces, 46 with a PDF attached,
  generated from `kb/structure/content-index.json` by `app/make-data.py`.
- **Quick guides** — 81 guides in 12 categories; 27 are wired to the exact
  hosted PDF, the rest link to the space they live in.

For a specific need ("I need to find things for dental care") the answer is:
the lessons and guides for it → **build your call list** in the AI Search →
**take it to a Q&A** or the Thursday clinic.

Regenerate the lesson index after a structure re-scrape:
`python3 app/make-data.py && node app/build.js` (build.js runs from `app/`).

`node test.js` enforces this — the "no outside contacts" suite fails the build
if any subject answer leaks a `.gov`/`.org` address, a phone number or a mailto,
if any rendered link points outside `mn.co`/`mightynetworks.com`, or if a subject
answer comes back without lessons and quick guides on it.

## Files
- `index.html` + `data.js` + `app.js` — the working app (dev version)
- `lesko-navigator.html` — single-file build, this is what gets published
- rebuild the single file after editing: `node build.js`
- `node test.js` — regression suite (run from this directory)

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
