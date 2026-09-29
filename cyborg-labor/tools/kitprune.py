#!/usr/bin/env python3
"""Keeps only the kit pieces haus.js/kit users reference (literal names + generated wall/cabin/station names)."""
import json, re, os, sys
src = open('js/haus.js').read()
lits = set(re.findall(r"'([a-zA-Z0-9_\-]+)'", src))
kinds = {'door','window-shutters','window-glass','window-round','window-small','window-stone','detail-cross','detail-diagonal','detail-horizontal'}
keep = {
  'town': lits | {'roof-window','roof-high-window'} | {pre+'-'+k for pre in ('wall','wall-wood') for k in kinds} | {'wall','wall-wood'},
  'holiday': lits | {'cabin-'+k for k in lits},
  'station': lits | {'wall-'+k for k in lits},
}
for f in sorted(os.listdir('assets/kits')):
    if not f.endswith('.json'): continue
    pk = f[:-5]; d = json.load(open('assets/kits/'+f)); ks = keep.get(pk, lits)
    names = {k.split('#')[0] for k in ks}
    out = {k: v for k, v in d.items() if k in names}
    if pk in ('graveyard', 'platformer'):
        os.remove('assets/kits/'+f); print(f, 'removed (unused)'); continue
    before = os.path.getsize('assets/kits/'+f)
    json.dump(out, open('assets/kits/'+f, 'w'), separators=(',', ':'))
    print(f, len(d), '->', len(out), before//1024, '->', os.path.getsize('assets/kits/'+f)//1024, 'KB')
