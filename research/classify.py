import json,re,collections
def clean(t):
    t=re.sub(r'<[^>]+>',' ',t or '')
    for a,b in [('&amp;','&'),('&nbsp;',' '),('&gt;','>'),('&lt;','<'),('&#39;',"'"),('&quot;','"')]:
        t=t.replace(a,b)
    return re.sub(r'\s+',' ',t).strip()

R=lambda p: re.compile(p,re.I)
# ordered rules: (category, regex). First match wins.
RULES=[
 ('CANCEL_SUBSCRIPTION', R(r'\b(cancel|canceling|cancelling|cancelled|canceled|stop|end|terminate|discontinue|quit|delete|close)\b[^.?!]{0,40}\b(subscription|subscrib\w*|membership|member ship|account|service|auto[- ]?renew\w*|billing|payment|plan)\b')),
 ('CANCEL_SUBSCRIPTION', R(r'\b(subscription|membership)\b[^.?!]{0,30}\b(cancel|stop|end|terminate)\b')),
 ('CANCEL_SUBSCRIPTION', R(r'\bunsubscribe\b|\bunsubscrbe\b|\bsubscribtion\b|\bsubcription\b|\bopt out\b|\bopt-out\b')),
 ('REFUND_BILLING', R(r'\brefund\w*\b|\breimburse\w*\b|\bmoney back\b|\bcharged?\b[^.?!]{0,40}\b(twice|again|card|account|month|year|without)\b|\bdouble\s*charg|\bovercharg')),
 ('REFUND_BILLING', R(r'\bbilling\b|\bbilled\b|\bcredit card\b|\bdebit card\b|\bpayment (method|info\w*|declined|issue|problem)\b|\bchange my (card|payment)\b|\bcharge(s|d)? (on|to) my\b')),
 ('LOGIN_ACCESS', R(r"\b(log ?in|login|logging in|sign ?in|signing in|log on|password|passwrd|pass word|username|user name)\b")),
 ('LOGIN_ACCESS', R(r"\b(locked out|can'?t get (in|into)|cannot get (in|into)|no account found|account not found|access my account|get into my account)\b")),
 ('AI_TOOL', R(r'\b(a\.?i\.?)\b[^.?!]{0,40}\b(tool|research\w*|report|bot|chat|work\w*|use|find)\b|\bask lesko ai\b|\bai grant\b|\bgrant researcher\b|\byour ai\b|\bthe ai\b')),
 ('EMAIL_NOTIFICATIONS', R(r'\b(too many|so many|stop (the )?|turn off|reduce|delete|remove)\b[^.?!]{0,25}\b(emails?|notification\w*|alerts?)\b|\bnotification settings\b|\bemail settings\b|\bstop emailing\b')),
 ('CALLS_EVENTS_REPLAYS', R(r'\b(zoom|webinar)\b|\b(live|class|workshop|coaching|q ?& ?a|session|call)\b[^.?!]{0,40}\b(link|time|schedule|when|register|registration|sign up|join|missed|replay|recording|record)\b')),
 ('CALLS_EVENTS_REPLAYS', R(r'\b(replay|recording|recorded)\b[^.?!]{0,40}\b(class|call|workshop|session|event|where|find|watch)\b|\bwhere.{0,25}\breplay')),
 ('CALLS_EVENTS_REPLAYS', R(r'\bhow do i (join|attend|get (on|into))\b[^.?!]{0,30}\b(call|class|live|meeting|workshop)\b|\bwhat time is\b[^.?!]{0,30}\b(call|class|live)\b')),
 ('HUMAN_SUPPORT', R(r'\b(talk|speak|chat)\b[^.?!]{0,30}\b(to|with)\b[^.?!]{0,25}\b(someone|somebody|a person|a human|real person|rep\b|representative|agent|advisor|navigator|coach)\b')),
 ('HUMAN_SUPPORT', R(r'\b(one[- ]on[- ]one|1[- ]on[- ]1|1:1|personal help|personalized help|book a call|schedule a call|customer (service|support)|contact (support|someone|customer)|phone number|call someone|help ?desk|who do i (contact|talk|call)|reach (someone|support))\b')),
 ('HUMAN_SUPPORT', R(r'\bnavigator\b')),
 ('APP_DEVICE', R(r'\b(app)\b[^.?!]{0,40}\b(download|install|find|get|store|phone|tablet|ipad|iphone|android|laptop|computer|qr)\b|\bdownload the app\b|\bmighty ?(networks?|app)\b|\bplay ?store\b|\bapp ?store\b')),
 ('GETTING_STARTED', R(r"\b(where|how)\b[^.?!]{0,25}\b(do i|should i|to)\b[^.?!]{0,20}\b(start|begin|get started)\b|\bwhere do i start\b|\bwhere to start\b|\bhow do i get started\b|\bgetting started\b|\bwhat('| i)?s (the )?next step\b|\bwhat do i do next\b|\bwhat now\b")),
 ('GETTING_STARTED', R(r"\b(new|just (joined|signed up)|newbie)\b[^.?!]{0,60}\b(lost|confused|overwhelmed|don'?t know|dont know|not sure|where do i|what do i|how do i|start)\b")),
 ('GETTING_STARTED', R(r"\bi'?m new\b|\bi am new\b|\bjust joined\b|\bjust signed up\b|\bnew member\b|\bnew here\b")),
 ('NAVIGATION_FINDING', R(r'\bnavigat\w+\b|\bfind my way\b|\bget around\b[^.?!]{0,20}\b(site|app|page|here)\b|\b(site|website|app|platform|page)\b[^.?!]{0,25}\b(confusing|hard to|difficult|overwhelming|maze|labyrinth)\b')),
 ('NAVIGATION_FINDING', R(r"\b(where|how)\b[^.?!]{0,20}\b(do i|can i|to)\b[^.?!]{0,20}\b(find|locate|get to|access)\b")),
 ('NAVIGATION_FINDING', R(r"\bcan'?t find\b|\bcannot find\b|\bwhere is the\b|\bwhere are the\b|\bhow do i find\b")),
 ('TECH_BROKEN', R(r"\b(link|page|video|button|site|website|app|form)\b[^.?!]{0,35}\b(not work\w*|won'?t work|doesn'?t work|does not work|broken|error|won'?t (load|open|play)|not load\w*|down\b|blank)\b")),
 ('TECH_BROKEN', R(r"\bnothing happens\b|\berror message\b|\bkeeps? (crashing|freezing)\b|\bglitch\b")),
 ('REPORTS_DOCS', R(r"\b(my|the|personal|comprehensive|state|mini)\b[^.?!]{0,20}\breport\b|\bmini ?500\b|\blesko ?500\b|\b(print|download|save)\b[^.?!]{0,25}\b(report|document|pdf|list|guide|book)\b|\bnever (got|received)\b[^.?!]{0,25}\b(report|book)\b|\bwhere is my (report|book)\b")),
 ('PROFILE_ACCOUNT', R(r"\b(change|update|edit|fix)\b[^.?!]{0,25}\b(email|e-mail|profile|name|photo|picture|address|phone)\b|\bprofile (settings|picture|photo)\b|\bmy profile\b")),
 ('PRICING_ACCESS_TIER', R(r"\b(how much|what does it cost|the cost|price|pricing|fee)\b[^.?!]{0,40}\b(membership|subscription|month|year|pay|cost|this)\b|\bwhat (do|am) i (get|paying)\b|\bwhat'?s included\b|\bfree trial\b|\bupgrade\b|\bpro member\b|\bwhat i paid for\b")),
]
def classify(t):
    for cat,rx in RULES:
        if rx.search(t): return cat
    return 'GRANT_HELP_SEEKING'

if __name__=='__main__':
    q=json.load(open('qc_sample.json'))
    out=[]
    for p in q:
        t=clean(p['text'])
        if len(t)<3: continue
        p2=dict(p); p2['clean']=t; p2['cat']=classify(t)
        out.append(p2)
    json.dump(out,open('qc_classified.json','w'))
    c=collections.Counter(x['cat'] for x in out)
    tot=len(out); prac=sum(v for k,v in c.items() if k!='GRANT_HELP_SEEKING')
    print('classified posts:',tot,'practical:',prac,f'({prac/tot:.1%})')
    for k,v in c.most_common():
        print(f'{v:5d}  {v/tot:6.1%}  {k}')
