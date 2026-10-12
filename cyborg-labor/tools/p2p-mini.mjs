// Mini-Test der Direktverbindung ohne Spiel: node tools/p2p-mini.mjs
import { chromium } from '/tmp/claude-0/tk/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import { fakeRelay, relayStats } from './fake-relay.mjs';
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const srv = http.createServer((q, s) => { let u = decodeURIComponent(q.url.split('?')[0]); fs.readFile(path.join(root, u), (e, b) => { if (e) { s.writeHead(404); s.end(); return } s.writeHead(200, { 'content-type': u.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8' }); s.end(b) }) });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const proxy = process.env.HTTPS_PROXY && !process.env.NOPROXY ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy, args: ['--disable-features=WebRtcHideLocalIpsWithMdns'] });
const r = 'mini-' + Math.random().toString(36).slice(2, 7); const pages = [];
for (let i = 0; i < 2; i++) { const ctx = await browser.newContext({ ignoreHTTPSErrors: true }); if (!process.env.REAL) await fakeRelay(ctx); const p = await ctx.newPage(); await p.route('https://cyborg.test/**', q => { const f = path.join(root, decodeURIComponent(new URL(q.request().url()).pathname)); q.fulfill({ path: f, contentType: f.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8' }) }); p.on('console', m => console.log('page' + i, m.type(), m.text().slice(0, 160))); await p.goto(`https://cyborg.test/tools/p2p-mini.html?r=${r}`); pages.push(p) }
for (let t = 0; t < 12; t++) { await pages[0].waitForTimeout(5000); const s = await Promise.all(pages.map(p => p.evaluate(() => ({ relays: window.__relays, log: window.__log.slice(-3) })))); console.log(JSON.stringify(s), JSON.stringify(relayStats)); if (s.every(x => x.log.some(l => l.includes('msg')))) break }
await browser.close(); srv.close();
