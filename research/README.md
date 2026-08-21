# Lesko Help — Member FAQ Research

Research pass to identify the **practical / technical / subscription / community-app**
questions members ask most often, as the knowledge base for a member-facing FAQ bot.

Source: **Lesko Help MCP community server only** (`lesko-help-2`). No other communities,
connectors, or team tooling were queried.

## Method

1. **Community map** — `get_network`, `list_spaces`, `list_spaces_collections`.
   49 spaces; the `QUESTIONS CHANNEL` (id `11054387`) is where members post questions.
2. **Time-stratified sample** — the feed cursor is a base64 unix timestamp, so the feed
   was sampled at ~monthly points from 2022-10 to 2026-08, plus continuous pagination
   over the most recent ~5 weeks. Yield: **1,600 unique QUESTIONS CHANNEL posts**
   (1,538 with usable text) spread across 22 monthly strata.
3. **Targeted semantic search** — ~15 `search_network` queries per practical theme to
   confirm each theme persists across the full history and to harvest phrasings.
4. **Classification** — a high-precision regex pass produced 212 candidates; every
   candidate was then **read and labelled by hand**. Two recall passes over the
   non-candidates recovered a further 36 posts the strict rules missed. Staff/host
   posts and grant-seeking posts were excluded.

## Headline

Of 1,538 member posts in the QUESTIONS CHANNEL, **148 (9.6%)** are practical/platform
questions rather than grant or help-seeking questions. The channel runs at roughly
**10.3 new posts/day (~308/month)**, so practical questions arrive at roughly
**30/month (~360/year)**.

## Ranked list — most asked practical questions

| # | Theme | Posts in sample | Share of practical | Est./month |
|---|-------|----------------:|-------------------:|-----------:|
| 1 | Cancel subscription / membership | 35 | 23.6% | ~7 |
| 2 | Refunds, charges & payment method | 23 | 15.5% | ~4–5 |
| 3 | Live calls, Zoom links & replays | 18 | 12.2% | ~4 |
| 4 | Personal Report / mini-500 / books | 18 | 12.2% | ~4 |
| 5 | Navigating & finding things on the site | 17 | 11.5% | ~3–4 |
| 6 | Getting started / what do I do next | 7 | 4.7% | ~1–2 |
| 7 | Talking to a human / 1-on-1 help | 7 | 4.7% | ~1–2 |
| 8 | The AI grant research tool | 5 | 3.4% | ~1 |
| 9 | Login & password | 4 | 2.7% | ~1 |
| 10 | The app / device problems | 4 | 2.7% | ~1 |
| 11 | Broken links, videos & errors | 4 | 2.7% | ~1 |
| 12 | Profile & account details | 2 | 1.4% | <1 |
| 13 | Email & notification volume | 2 | 1.4% | <1 |
| 14 | Pricing, trial & what's included | 2 | 1.4% | <1 |

**Billing and subscription (#1 + #2) is 39% of all practical questions** — more than
the next three themes combined.

## Files

- `qc_sample.json` — the 1,600-post time-stratified sample
- `qc_sig.json` — per-post signal detection output
- `labels.json` / `labeled_examples.json` — hand-assigned labels and source quotes
- `final_counts.json` — the ranked counts above
- `sig.py`, `classify.py`, `final_counts.py` — the analysis scripts
- `raw/` — raw MCP responses (feed pages and searches)

## Caveats

- Counts are from a sample, not a census; the ranking is robust but the per-month
  figures are estimates.
- The QUESTIONS CHANNEL is the main but not the only place questions land
  (`Say Hi & Member Chat` carries some too).
- Comments are not in the semantic search index, so follow-up questions asked inside
  comment threads are under-represented.
