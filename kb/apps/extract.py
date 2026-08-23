"""Extract readable content + links from the Lesko single-page apps."""
import re, html, json, os

APPS = {
 "roadmap":            "/home/user/lesko-help/lesko-roadmap",
 "call-sheet-instructions": "/home/user/giuliarobinmay/lesko-help-call-sheet-instructions",
 "onboarding":         "/home/user/giuliarobinmay/lesko-onboarding",
 "application-follow-up": "/home/user/giuliarobinmay/lesko-help-application-follow-up",
}

def strip(s):
    s = re.sub(r"<script.*?</script>", "", s, flags=re.S | re.I)
    s = re.sub(r"<style.*?</style>", "", s, flags=re.S | re.I)
    return s

def text_of(frag):
    return html.unescape(re.sub(r"<[^>]+>", " ", frag)).replace("\xa0", " ").strip()

def extract(path):
    src = strip(open(os.path.join(path, "index.html"), encoding="utf-8", errors="replace").read())
    title = text_of(re.search(r"<title[^>]*>(.*?)</title>", src, re.S | re.I).group(1)) \
            if re.search(r"<title", src, re.I) else None
    outline = [{"level": m.group(1).lower(), "text": text_of(m.group(2))}
               for m in re.finditer(r"<(h[1-6])[^>]*>(.*?)</\1>", src, re.S | re.I)
               if text_of(m.group(2))]
    body = re.sub(r"\n{3,}", "\n\n", re.sub(r"[ \t]{2,}", " ", text_of(src)))
    links, seen = [], set()
    for m in re.finditer(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', src, re.S | re.I):
        u = html.unescape(m.group(1))
        if u.startswith("#") or u in seen:
            continue
        seen.add(u)
        links.append({"label": text_of(m.group(2))[:80], "url": u})
    return {"title": title, "outline": outline, "links": links, "text": body}

if __name__ == "__main__":
    out = {}
    for name, path in APPS.items():
        if os.path.exists(os.path.join(path, "index.html")):
            out[name] = extract(path)
            print(f"{name:24s} headings={len(out[name]['outline']):3d} links={len(out[name]['links']):3d} chars={len(out[name]['text'])}")
    json.dump(out, open(os.path.join(os.path.dirname(__file__), "apps.json"), "w"), indent=1)
