"""Builds data/spyy-data.js (window.SPYY) from data/spyy-data.json + prototype extensions.
Real = captured from the live dashboard (Sep 2026). Sample = prototype fill, flagged sample:true."""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((root/'data/spyy-data.json').read_text())

industry = {'dietfit-ai':'Health & fitness','cal-ai':'Health & fitness','duolingo':'Education'}
for b in d['brands']:
    b['industry'] = industry[b['id']]; b['sample'] = False

# per-ad platform-specific fields for the real ads
tk = {
 'dietfit-gym':   dict(objective='App installs', ctrTop=87, budget='Medium', cta='Download', language='English', audience='18–34', aiGenerated=False, realPeople=True, firstTime=False),
 'duolingo-green':dict(objective='Community interaction', ctrTop=94, budget='High', cta='Download', language='English', audience='13–24', aiGenerated=False, realPeople=False, firstTime=False),
 'cal-ai-track':  dict(objective='App installs', ctrTop=91, budget='High', cta='Install now', language='English', audience='18–34', aiGenerated=False, realPeople=True, firstTime=True),
}
meta = {
 'dietfit-balance':dict(platforms=['facebook','instagram'], versions=3, cta='Install now', linkDomain='APPS.APPLE.COM', linkTitle='Dietfit: Calorie Counter', mediaType='Video', language='English'),
 'dietfit-food':   dict(platforms=['facebook','instagram','messenger'], versions=2, cta='Install now', linkDomain='APPS.APPLE.COM', linkTitle='Dietfit: Calorie Counter', mediaType='Video', language='English'),
 'duolingo-chess': dict(platforms=['facebook','instagram','messenger','threads'], versions=4, cta='Learn more', linkDomain='DUOLINGO.COM', linkTitle='Duolingo — chess, math, music', mediaType='Video', language='English'),
 'cal-ai-outdoors':dict(platforms=['facebook','instagram'], versions=5, cta='Install now', linkDomain='APPS.APPLE.COM', linkTitle='Cal AI — Food Calorie Tracker', mediaType='Video', language='English'),
 'duolingo-lesson':dict(platforms=['facebook','instagram','audience_network'], versions=1, cta='Install now', linkDomain='APPS.APPLE.COM', linkTitle='Duolingo', mediaType='Video', language='English'),
}
for a in d['ads']:
    a['sample'] = False
    a['industry'] = industry[a['brandId']]
    a['channels'] = [a['source'] if a['source']!='appstore' else 'meta']
    if a['id'] in tk: a['tiktok'] = tk[a['id']]
    if a['id'] in meta:
        a['meta'] = meta[a['id']]
        a['meta'].setdefault('libraryId', a.get('libraryId') or str(1000000000000000 + sum(ord(c)*97**k for k,c in enumerate(a['id'])) % 899999999999999))

samples = [
 ('meadow-trips','Meadow Trips','Travel','assets/figma/signin/tile-1.webp','Wildflower weekends, two hours from the city','Short scenic cuts that sell the feeling before the price.','Scenic montage','Traffic','Book now','meadowtrips.co',31,22,'Low',72,'1.9M','64.3K'),
 ('lumen-stones','Lumen Stones','Beauty & wellness','assets/figma/signin/tile-2.webp','Pick the stone that matches your week','Close texture shots with a quiz-style hook drive saves.','Product close-up','Product sales','Shop now','lumenstones.shop',18,15,'Low',81,'412K','29.8K'),
 ('field-day','Field Day','Fashion','assets/figma/signin/tile-3.webp','The linen set that moves with you','Motion-first apparel ad: the product is shown doing its job.','Lifestyle demo','Product sales','Shop now','fieldday.store',57,19,'Medium',88,'2.4M','148K'),
 ('crate-and-co','Crate & Co','Home & living','assets/figma/signin/tile-4.webp','One crate, four rooms','A single object restyled in each scene — a cheap, repeatable format.','Product montage','Product sales','Shop now','crateandco.com',12,27,'Low',64,'238K','9.1K'),
 ('gallery-pass','Gallery Pass','Arts & entertainment','assets/figma/signin/tile-5.webp','Every museum in the city, one pass','Iconic artwork as a thumb-stop, then the price anchor.','Static-to-motion','Lead generation','Sign up','gallerypass.app',44,14,'Medium',79,'780K','41.6K'),
 ('nest-egg','Nest Egg','Finance','assets/figma/signin/tile-6.webp','Retirement, explained by people living it','Testimonial from a real retiree; trust before features.','Testimonial','Lead generation','Learn more','nestegg.money',96,48,'High',83,'1.1M','22.4K'),
 ('glow-lab','Glow Lab','Beauty & wellness','assets/figma/signin/phone.webp','My 3-step morning, no filter','Selfie-camera routine; the product appears in step two.','Talking head','Product sales','Shop now','glowlab.co',23,33,'Medium',90,'3.6M','251K'),
]
for i,(bid,name,ind,img,title,desc,fmt,obj,cta,dom,days,dur,budget,ctr,views,likes) in enumerate(samples):
    d['brands'].append(dict(id=bid,name=name,category=ind,industry=ind,description=desc,confidence=80+i*2,domain=dom,sample=True,accounts=[
        dict(source='meta',label=name,handle='@'+bid.replace('-',''),verified=i%2==0),
        dict(source='tiktok',label=name,handle='@'+bid.replace('-',''),verified=True)]))
    d['ads'].append(dict(id=bid+'-hero',brandId=bid,title=title,description=desc,source='tiktok',channels=['tiktok','meta'],
        format=fmt,region=['US','GB','US','CA','US','US','AU'][i],active=i!=3,daysRunning=days,duration=dur,
        startedAt=f"2026-0{8 if days<40 else 7}-{10+i:02d}",image=img,sample=True,industry=ind,
        metrics=dict(views=views,likes=likes,saves=f"{3+i}.{i}K",shares=f"{400+i*37}",comments=f"{1+i%3}.{i}K",engagement=f"{5+i%4}.{i}%"),
        tiktok=dict(objective=obj,ctrTop=ctr,budget=budget,cta=cta,language='English',audience=['25–44','18–34','18–24','25–44','18–34','45+','18–24'][i],aiGenerated=i in (1,4),realPeople=i not in (1,3,4),firstTime=i in (0,6)),
        meta=dict(platforms=[['facebook','instagram'],['instagram'],['facebook','instagram','threads'],['facebook','instagram','messenger'],['facebook','audience_network'],['facebook'],['instagram','threads']][i],
                  versions=[2,1,6,1,3,2,4][i],cta=cta,linkDomain=dom.upper(),linkTitle=name,mediaType=['Video','Image','Video','Image','Meme','Video','Video'][i],language='English',
                  libraryId=str(1432087765000000+i*918273645)),
        scores={'Hook strength':70+i*3,'Audience fit':68+i*4,'Product relevance':75+i*2,'Conversion intent':55+i*5,'Relatability':72+i*3,'Brand safety':90-i*2},
        takeaways=[desc,'The product is visible within the first two seconds.','Format is cheap to reproduce with in-house footage.'],
        tags=[fmt, obj, ind], audience=['General'], adaptability=60+i*4))

(root/'data/spyy-data.js').write_text('/* Generated by tools/build-data.py — do not edit by hand. */\nwindow.SPYY = ' + json.dumps(d, ensure_ascii=False, indent=1) + ';\n')
print(len(d['ads']), 'ads', len(d['brands']), 'brands')
