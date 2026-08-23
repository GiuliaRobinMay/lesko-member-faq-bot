# Quick Guide PDFs — extracted knowledge

Structured text from the Lesko Help Quick Guide PDFs, for the member FAQ bot.

- `pdf/` — source PDFs as uploaded
- `parse.py` — extractor (pdfminer.six). Drop new PDFs into `pdf/` and re-run:
  `python3 parse.py` — idempotent, rewrites `guides.json`
- `guides.json` — one record per guide:
  `category`, `title`, `before_you_start`, `watch_out`, `tip`,
  `resources[{name, description, link}]`, plus full `text`

Every guide follows the same layout: intro → "Before you start" → numbered
sections of resources (each with a → link) → "Watch out for" → "A tip that
helps" → "Need help where you live?" → notes space. The parser keys off that.

Note: the in-community versions of these same guides are already hosted on
Mighty Networks with direct download URLs — see `kb/structure/content-index.json`.
The bot should answer with the guide's content AND link the hosted PDF.
