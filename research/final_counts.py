import json
FINAL={
"CANCEL_SUBSCRIPTION":35,"REFUND_BILLING":23,"CALLS_EVENTS_REPLAYS":18,"REPORTS_DOCS":18,
"NAVIGATION_SITE":17,"GETTING_STARTED":7,"HUMAN_SUPPORT":7,"AI_TOOL":5,"LOGIN_ACCESS":4,
"APP_DEVICE":4,"TECH_BROKEN":4,"PROFILE_ACCOUNT":2,"EMAIL_NOTIFICATIONS":2,"PRICING_TIER":2}
json.dump(FINAL,open('final_counts.json','w'))
t=sum(FINAL.values())
print('practical posts in sample:',t,'/1538 =',f'{t/1538:.1%}')
for k,v in sorted(FINAL.items(),key=lambda x:-x[1]):
    print(f'{v:4d} {v/t:6.1%}  {k}')
