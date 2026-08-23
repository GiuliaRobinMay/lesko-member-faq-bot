#!/usr/bin/env python3
"""Fold the community lesson index into app/data.js.

Adds two keys to window.LESKO:
  lessons  {space: [{t: title, u: lesson url, p: pdf url or ""}]}
  catspace {quick guide category: lesson space}

Everything the bot points at has to be a real place inside the community, so
both come straight out of kb/structure/content-index.json — nothing typed by
hand except the category -> space map, which is checked against the index.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ci = json.load(open(os.path.join(ROOT, "kb/structure/content-index.json")))

# Dated class write-ups are archive material, not lessons a member should be
# sent to. Index stubs ("➽ Healthcare Quick Guides") just point at the space
# we already link, so they add nothing.
SKIP = re.compile(r"^\s*(➽|\d{2}-\d{2}-\d{2}\s*\||Review (for|of) |Links that were shared)", re.I)

# Only files the community hosts itself. A couple of lessons link out to an
# agency PDF, and the bot must never hand a member an outside address.
OURS = re.compile(r"^https?://[^/]*mightynetworks\.com/", re.I)

lessons = {}
for space, arr in ci["lessons"].items():
    keep = []
    for l in arr:
        if SKIP.search(l["title"]):
            continue
        ours = [u for u in l["pdfs"] if OURS.match(u)]
        keep.append({"t": l["title"], "u": l["url"], "p": (ours or [""])[0]})
    if keep:
        lessons[space] = keep

# Quick guide category -> the space its lessons live in.
CATSPACE = {
    "Healthcare Assistance":  "Healthcare Assistance",
    "Programs For Veterans":  "Programs for Veterans",
    "Start A Business":       "Business - Nonprofits & Career",
    "Launch A Nonprofit":     "Business - Nonprofits & Career",
    "Boost Your Career":      "Business - Nonprofits & Career",
    "Family & Children":      "Families - Seniors & Disabilities",
    "Seniors & Disabilities": "Families - Seniors & Disabilities",
    "Taxes Help Guidance":    "Taxes & Legal Help",
    "Find Legal Help":        "Taxes & Legal Help",
    "Cars & Car Repairs":     "Bills - Debt - Homes & Cars",
    "Home & Housing Help":    "Bills - Debt - Homes & Cars",
    "Pay Debt & Bills":       "Bills - Debt - Homes & Cars",
}
for cat, space in CATSPACE.items():
    if space not in lessons:
        sys.exit("category %r maps to unknown space %r" % (cat, space))

path = os.path.join(ROOT, "app/data.js")
raw = open(path, encoding="utf-8").read().strip()
assert raw.startswith("window.LESKO=") and raw.endswith(";")
D = json.loads(raw[len("window.LESKO="):-1])

for cat in D["library"]:
    if cat not in CATSPACE:
        sys.exit("quick guide category %r has no space mapping" % cat)

# Where a quick guide's PDF is actually hosted in the community, hang the real
# download URL and the lesson that carries it on the guide, so the bot can hand
# a member the file instead of describing it.
pdfbase = {}
for space, arr in ci["lessons"].items():
    for l in arr:
        for u in l["pdfs"]:
            if OURS.match(u):
                pdfbase[os.path.basename(u)[:-4]] = {"u": u, "lesson": l["title"], "url": l["url"]}

wired = 0
for cat, arr in D["library"].items():
    for g in arr:
        hit = pdfbase.get(g.get("file", ""))
        if hit:
            g["pdf"] = hit["u"]
            g["lesson"] = hit["lesson"]
            g["lessonUrl"] = hit["url"]
            wired += 1

D["lessons"] = lessons
D["catspace"] = CATSPACE
open(path, "w", encoding="utf-8").write(
    "window.LESKO=" + json.dumps(D, ensure_ascii=False, separators=(", ", ": ")) + ";")

print("lessons: %d spaces, %d lessons (%d with a PDF)" % (
    len(lessons), sum(len(v) for v in lessons.values()),
    sum(1 for v in lessons.values() for l in v if l["p"])))
print("categories mapped: %d" % len(CATSPACE))
print("quick guides wired to a hosted PDF: %d of %d" % (
    wired, sum(len(v) for v in D["library"].values())))
