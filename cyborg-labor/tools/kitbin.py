#!/usr/bin/env python3
"""Shrinks packed kit JSON: p/c/i arrays become base64 typed arrays (P int16, C uint8, I uint16/uint32).
kit.js decodes both forms. usage: kitbin.py <in.json> [<out.json>]"""
import json, sys, base64, array
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else src
d = json.load(open(src))
def b64(typ, vals): return base64.b64encode(array.array(typ, vals).tobytes()).decode()
for k, v in d.items():
    if 'p' not in v: continue
    assert max(abs(x) for x in v['p']) < 32767, k
    n = len(v['p']) // 3
    v['P'] = b64('h', v.pop('p')); v['C'] = b64('B', v.pop('c'))
    w = 2 if n < 65536 else 4
    v['I'] = b64('H' if w == 2 else 'I', v.pop('i')); v['iw'] = w
json.dump(d, open(out, 'w'), separators=(',', ':'))
