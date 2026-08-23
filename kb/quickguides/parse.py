"""Parse Lesko Quick Guide PDFs into structured JSON for the FAQ bot.

Usage:  python3 parse.py      # re-parses every PDF in ./pdf -> guides.json
Drop new Quick Guide PDFs into ./pdf and re-run; it is idempotent.
"""
import json, re, os, glob, collections
from pdfminer.high_level import extract_text

WORDY = re.compile(r"[A-Za-z]")

def despace(s):
    """'Cars & Car R E Pa I R S' -> 'Cars & Car REPAIRS'.

    PDF letter-spacing emits one glyph per token. Join any run of >=3
    consecutive short alphabetic tokens; leave normal words alone.
    """
    s = re.sub(r"\s{2,}", " \x00 ", s)   # mark real word gaps
    toks = s.split(" ")
    out, run = [], []
    def flush():
        if len(run) >= 3:
            out.append("".join(run))
        else:
            out.extend(run)
        run.clear()
    for t in toks:
        if t and len(t) <= 2 and WORDY.search(t):
            run.append(t)
        else:
            flush()
            out.append(t)
    flush()
    return " ".join(x for x in out if x).replace(" \x00 ", " ").replace("\x00", " ").strip()

def tidy(t):
    t = re.sub(r"[ \t]+$", "", t, flags=re.M)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()

def parse(raw, fname):
    t = raw.replace("Lesko?Help", "").replace("♠ ♥ ♦ ♣", "")
    t = re.sub(r"\n?Lesko Help\s*\n.*?\nPage \d+ of \d+\s*\n?", "\n", t, flags=re.S)
    # de-space first: word gaps are 2+ spaces and must survive
    flat = "\n".join(despace(l) for l in t.split("\n"))
    flat = tidy(re.sub(r"[ \t]+", " ", flat))
    t = tidy(re.sub(r"[ \t]+", " ", t))
    lines = [l.strip() for l in flat.split("\n")]

    category = title = None
    for i, l in enumerate(lines):
        if l.upper().replace(" ", "").startswith("QUICKGUIDE"):
            if "·" in l:
                category = l.split("·", 1)[-1].strip().title()
            for nxt in lines[i + 1:]:
                if nxt and len(nxt) > 3 and not nxt.isupper():
                    title = nxt
                    break
            break

    def section(start, stops):
        m = re.search(start, flat, re.I)
        if not m:
            return None
        rest = flat[m.end():]
        pos = [p for p in (rest.find(s) for s in stops) if p > 0]
        return tidy(rest[:min(pos)] if pos else rest[:800])

    before = section(r"BEFORE YOU START", ["WATCH OUT", "A TIP THAT"])
    watch  = section(r"WATCH OUT FOR",    ["A TIP THAT", "NEED HELP WHERE", "MY NOTES"])
    tip    = section(r"A TIP THAT HELPS", ["NEED HELP WHERE", "MY NOTES", "WATCH OUT"])

    # A resource is the text between the end of the previous link and this link.
    res = []
    marks = [(m.start(), m.end(), m.group(1).strip())
             for m in re.finditer(r"→\s*([^\n]+)", flat)]
    prev_end = 0
    for start, end, link in marks:
        block = flat[prev_end:start]
        prev_end = end
        ls = [l.strip() for l in block.split("\n") if l.strip()]
        ls = [l for l in ls
              if not (l.isupper() and len(l) > 6) and not re.fullmatch(r"\d{1,2}", l)]
        # strip a leading section number: "1 Start With Your Local USDA Office"
        if ls:
            ls[0] = re.sub(r"^\d{1,2}\s+", "", ls[0])
        # the first block also contains the guide intro; keep only the tail
        if len(ls) > 2 and len(ls[0]) > 60:
            ls = ls[-2:]
        name = ls[0] if ls else ""
        desc = " ".join(ls[1:]) if len(ls) > 1 else ""
        if len(name) > 80 and not desc:
            desc, name = name, name.split(".")[0][:70]
        if title and name.strip().lower() == title.strip().lower():
            name, desc = (desc.split(".")[0][:70], desc) if desc else ("", desc)
        res.append({"name": name, "description": desc, "link": link})

    return {"file": fname, "category": category, "title": title,
            "before_you_start": before, "watch_out": watch, "tip": tip,
            "resources": res, "text": t}

if __name__ == "__main__":
    out = {}
    for f in sorted(glob.glob("pdf/*.pdf")):
        name = re.sub(r"^[0-9a-f]{8}-", "", os.path.basename(f)).replace(".pdf", "")
        out[name] = parse(extract_text(f), name)
    json.dump(out, open("guides.json", "w"), indent=1)
    print(f"parsed {len(out)} guides\n")
    for k, n in collections.Counter(v["category"] for v in out.values()).most_common():
        print(f"  {n:3d}  {k}")
    print()
    for k in list(out)[:2]:
        v = out[k]
        print(f"{v['category']} | {v['title']} | {len(v['resources'])} resources")
        for r in v["resources"][:3]:
            print(f"   - {r['name'][:48]:48s} -> {r['link'][:42]}")
