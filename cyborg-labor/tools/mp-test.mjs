// Mehrspieler-Test: zwei getrennte Browser (eigene Spielstände) mit demselben
// Mehrspieler-Code. Prüft, ob sie sich über die öffentlichen Vermittler finden
// und sich gegenseitig als Figur sehen.
// node tools/mp-test.mjs [outdir] [code]
import { chromium } from '/tmp/claude-0/tk/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import { fakeRelay, relayStats } from './fake-relay.mjs';
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const [outdir = '/tmp/claude-0/mp', code = 'test-' + Math.random().toString(36).slice(2, 8)] = process.argv.slice(2);
fs.mkdirSync(outdir, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.mp3': 'audio/mpeg', '.json': 'application/json', '.css': 'text/css', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, s) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(root, u), (e, b) => { if (e) { s.writeHead(404); s.end(); return } s.writeHead(200, { 'content-type': (types[path.extname(u)] || 'application/octet-stream') + (/html|javascript|css|json/.test(types[path.extname(u)]||'') ? '; charset=utf-8' : '') }); s.end(b) }) });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-features=WebRtcHideLocalIpsWithMdns'] });
const logs = [];
async function player(name) {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 520 }, ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  if (!process.env.REAL) await fakeRelay(ctx);
  const page = await ctx.newPage();
  await ctx.route('https://cyborg.test/**', r => { let u = decodeURIComponent(new URL(r.request().url()).pathname); if (u === '/') u = '/index.html'; const f = path.join(root, u); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); const ext = path.extname(f); r.fulfill({ path: f, contentType: (types[ext] || 'application/octet-stream') + (/html|javascript|css|json/.test(types[ext] || '') ? '; charset=utf-8' : '') }) });
  await ctx.route('https://cdn.jsdelivr.net/npm/three@0.147.0/**', r => { const rel = r.request().url().split('three@0.147.0/')[1]; r.fulfill({ path: path.join('/tmp/claude-0/tk/node_modules/three', rel), contentType: 'text/javascript' }) });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ body: '', contentType: 'text/css' }));
  page.on('console', m => { if (m.type() === 'error' || /NET/.test(m.text())) logs.push(name + ' ' + m.type() + ': ' + m.text().slice(0, 200)) });
  page.on('requestfailed', r => logs.push(name + ' FAIL ' + r.url().slice(0, 90)));page.on('response', r => { if (r.status() >= 400) logs.push(name + ' ' + r.status() + ' ' + r.url().slice(0, 90)) });
  page.on('pageerror', e => logs.push(name + ' PAGEERROR ' + e.message));
  await page.goto(`https://cyborg.test/`);
  await page.evaluate(([n, c]) => { const k = 'cyborg-labor-spiel-v3'; const v = JSON.parse(localStorage.getItem(k) || '{}'); v.story = Object.assign(v.story || {}, { intro: true }); v.tutDone = true; v.nick = n; localStorage.setItem(k, JSON.stringify(v)); localStorage.setItem('cyborg-labor-mp-code', c); localStorage.setItem('cyborg-labor-grafik', JSON.stringify('schnell')) }, [name, code]);
  await page.reload(); await page.waitForTimeout(3000);
  await page.click('.btn.primary.big').catch(() => logs.push(name + ' kein Start-Knopf'));
  return page;
}
const a = await player('Anna'), b = await player('Ben');
const t0 = Date.now(); let res = null;
while (Date.now() - t0 < (+process.env.MPT || 90000)) {
  await a.waitForTimeout(3000);
  const probe = async () => ({ mode: NET.mode, dbg: await NET.room().then(r => r && r.debug ? r.debug() : null), status: document.getElementById('chatStatus')?.textContent });
  const ra = await a.evaluate(probe).catch(e => ({ err: e.message }));
  const rb = await b.evaluate(probe).catch(e => ({ err: e.message }));
  res = { s: Math.round((Date.now() - t0) / 1000), a: ra, b: rb };
  if (/[1-9] online/.test(ra.status || '') && /[1-9] online/.test(rb.status || '')) break;
}
// Ben schreibt im Chat, Anna muss es sehen
await b.evaluate(() => { SOCIAL.toggleChat(true); const i = document.getElementById('chatIn'); i.value = 'Hallo Anna, hier ist Ben'; document.getElementById('chatForm').requestSubmit() }).catch(e => logs.push('chat ' + e.message));
let chat = null;
for (let i = 0; i < 20; i++) { await a.waitForTimeout(3000); chat = await a.evaluate(() => { SOCIAL.toggleChat(true); return 0 }).then(() => a.evaluate(() => ({ peers: SOCIAL.peers().map(p => p.nick + '@' + p.pl), msgs: [...document.querySelectorAll('#chatMsgs > div')].map(d => d.textContent).filter(t => /Ben/.test(t)) }))).catch(e => ({ err: e.message })); if (chat.msgs && chat.msgs.length) break }
logs.push('CHAT ' + JSON.stringify(chat)); logs.push('BEN ' + JSON.stringify(await b.evaluate(() => [...document.querySelectorAll('#chatMsgs > div')].map(d => d.textContent).slice(-3)).catch(e => e.message)));
await a.waitForTimeout(1000);
const seen = await a.evaluate(() => ({ status: document.getElementById('chatStatus')?.textContent, peerEnts: [...document.querySelectorAll('#chatMsgs div')].map(d => d.textContent).slice(-6) })).catch(e => ({ err: e.message }));
console.log(JSON.stringify({ code, res, seen, relay: relayStats, logs: [...new Set(logs)].filter(l => !/fonts|WebSocket connection/.test(l)).slice(0, 30) }, null, 1));
await a.screenshot({ path: path.join(outdir, 'anna.png'), timeout: 60000 }).catch(() => { }); await b.screenshot({ path: path.join(outdir, 'ben.png'), timeout: 60000 }).catch(() => { });
await browser.close(); srv.close();
