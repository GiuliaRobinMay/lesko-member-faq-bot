import json,re,collections
from classify import clean
R=lambda p: re.compile(p,re.I)

STRONG=[
 ('CANCEL_SUBSCRIPTION', R(r"\b(cancel|canceling|cancelling|stop|end|terminate|discontinue)\b[^.?!]{0,30}\b(my |the |this |your )?(subscription|subscrib\w*|membership|member ship|auto[- ]?renew\w*|recurring|monthly (charge|payment|fee)|billing)\b")),
 ('CANCEL_SUBSCRIPTION', R(r"\b(subscription|membership)\b[^.?!]{0,25}\b(cancel|cancelled|canceled|stop|end|terminate)\b|\bcancel (subscription|membership|subscribtion|subcription)\b|\bhow (do|can) i (cancel|unsubscribe)\b|\bunsubscribe\b|\bunsubscrbe\b")),
 ('REFUND_BILLING', R(r"\brefund\w*\b(?![^.?!]{0,20}\btax\b)|\breimburse\w*\b|\bmoney back\b|\bdouble ?charg|\bovercharg|\bcharged? (me|my (card|account|bank))\b|\bkeep (taking|charging)\b|\bauto[- ]?renew\w*\b|\btaken out of my (account|bank)\b")),
 ('REFUND_BILLING', R(r"\b(update|change|fix)\b[^.?!]{0,20}\b(payment|billing|card)\b|\bbilling (issue|problem|question|info\w*|address|wrong)\b|\bmy billing\b|\bcontact\b[^.?!]{0,15}\bbilling\b")),
 ('LOGIN_ACCESS', R(r"\bpassword\b|\bpasswrd\b|\blog ?in\b|\blogin\b|\blogging in\b|\bsign ?in\b|\bsigning in\b|\blog on\b|\blocked out\b|\bno account found\b|\baccount not found\b|\bcan'?t get (in|into my)\b|\bget into my account\b|\bemail and password\b")),
 ('APP_DEVICE', R(r"\b(download|install|get|find|where.{0,15})\b[^.?!]{0,25}\bthe app\b|\bdownload the app\b|\bmighty ?networks?\b|\bmighty app\b|\bapp ?store\b|\bplay ?store\b|\bqr code\b|\bapp (won'?t|doesn'?t|not) (work|load|download|install)\b|\bis there an app\b|\bwhat app\b|\bapp for (my )?(phone|ios|android|iphone|ipad)\b")),
 ('CALLS_EVENTS_REPLAYS', R(r"\bzoom\b|\breplay\w*\b|\brecording\b|\brecorded (class|call|session|event)\b|\bmeeting (id|link|invite)\b|\bwebinar\b|\b(class|call|workshop|session)\b[^.?!]{0,25}\b(link|schedule|what time|when is|register|sign ?up|join|missed)\b|\bhow do i (join|attend)\b")),
 ('EMAIL_NOTIFICATIONS', R(r"\b(too many|so many|stop|turn off|reduce|delete|remove|opt out of)\b[^.?!]{0,25}\b(emails?|notification\w*)\b|\bnotification settings\b|\bemail settings\b|\bstop (sending|emailing)\b")),
 ('AI_TOOL', R(r"\bask lesko ai\b|\bai (tool|report|researcher|research|bot|assistant|chat)\b|\bthe ai\b|\byour ai\b|\bai (isn'?t|doesn'?t|won'?t|not) (work|working|give)\b|\bgrant researcher\b|\buse the ai\b")),
 ('PROFILE_ACCOUNT', R(r"\b(change|update|edit)\b[^.?!]{0,20}\b(my )?(email address|e-?mail|profile|user ?name|display name|profile (pic\w*|photo))\b|\bmy profile\b|\bprofile settings\b|\bpersonal settings\b|\bdelete my account\b")),
 ('TECH_BROKEN', R(r"\b(link|page|video|button|site|website|app|form|tool)\b[^.?!]{0,30}\b(not work\w*|won'?t work|doesn'?t work|does not work|isn'?t work\w*|broken|won'?t (load|open|play)|not load\w*|is down\b|error)\b|\bnothing happens\b|\berror message\b|\blink is (dead|broken)\b")),
 ('NAVIGATION_SITE', R(r"\bnavigat\w+\b|\bget around (this|the) (site|app|page|platform)\b|\b(this |the )?(site|website|app|platform|page|system)\b[^.?!]{0,25}\b(is |so |very |too )?(confusing|hard to use|difficult|overwhelming|a maze|labyrinth)\b|\bfind my way (around|through)\b|\bhow does (this|it) (site|app|work)\b")),
 ('HUMAN_SUPPORT', R(r"\bcustomer (service|support)\b|\bcontact (support|customer|someone|a person|the team|admin)\b|\bphone number\b|\bhelp ?desk\b|\bspeak (to|with) (someone|a person|a human|a rep)\b|\btalk to (someone|a person|a human|a real)\b|\bwho (do|can) i (contact|call|talk to|email)\b|\bbook a call\b|\bschedule a call\b|\bnavigator\b|\breach (support|someone)\b")),
 ('GETTING_STARTED', R(r"\bwhere do i (start|begin)\b|\bwhere to start\b|\bhow do i (get )?start(ed)?\b|\bwhat('| i)?s (the )?next step\b|\bwhat do i do (next|now|first)\b|\bwhat'?s next\b|\bhow does this (work|all work)\b|\bfirst step\b|\bwhere should i start\b|\bgetting started\b|\bhow to get started\b|\bdon'?t know where to (start|begin)\b|\bnot sure where to (start|begin)\b|\bhow do i use (this|the) (site|app|platform|program)\b")),
 ('REPORTS_DOCS', R(r"\b(my|personal|comprehensive|state|mini)\s*(500)?\s*report\b|\bmini ?500\b|\blesko ?500\b|\bwhere is my (report|book)\b|\bnever (got|received)\b[^.?!]{0,25}\b(report|book)\b|\b(print|download|save)\b[^.?!]{0,20}\b(report|guide|document|pdf)\b|\brequest (a|my) report\b|\bupdate my (comprehensive|personal) report\b")),
 ('PRICING_TIER', R(r"\bhow much (does|is|do)\b[^.?!]{0,30}\b(cost|membership|subscription|month|pay)\b|\bwhat'?s included\b|\bwhat do i get (for|with)\b|\bfree trial\b|\btrial (period|membership|end)\b|\bupgrade (my|to)\b|\blesko pro\b|\bwhat am i paying\b")),
]
def sigs(t):
    return [c for c,rx in STRONG if rx.search(t)]

if __name__=='__main__':
    q=json.load(open('qc_sample.json'))
    rows=[]
    for p in q:
        t=clean(p['text'])
        if len(t)<3: continue
        s=sigs(t)
        rows.append({'id':p['id'],'pub':p['published'],'url':p['url'],'t':t,'sig':s,'comments':p.get('comments')})
    json.dump(rows,open('qc_sig.json','w'))
    cand=[r for r in rows if r['sig']]
    print('total',len(rows),'candidates',len(cand))
    c=collections.Counter(s for r in cand for s in r['sig'])
    for k,v in c.most_common(): print(f'{v:5d} {k}')
