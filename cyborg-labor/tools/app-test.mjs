// End-to-End-Test der ganzen App: node tools/app-test.mjs <outdir> [script]
// script: Folge von Schritten, z. B. "lab;world;walk:w:2;key:e;shot:x"
import { chromium } from '/tmp/claude-0/tk/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const three = '/tmp/claude-0/tk/node_modules/three';
const [outdir = '/tmp/claude-0/app', script = 'lab;shot:lab;world;wait:4000;shot:world'] = process.argv.slice(2);
fs.mkdirSync(outdir, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.mp3': 'audio/mpeg', '.json': 'application/json', '.css': 'text/css' };
const SKEL = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#faf9f5;color:#141413}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>';
const srv = http.createServer((q, s) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; const p = path.join(root, u);
  fs.readFile(p, (e, b) => { if (e) { s.writeHead(404); s.end(); return } if (u === '/index.html') b = Buffer.from(SKEL + b.toString() + '</body></html>'); s.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); s.end(b) }) });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const vp = script.includes('mobile') ? { width: 400, height: 820 } : script.includes('small') ? { width: 960, height: 600 } : { width: 1400, height: 860 };
const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1, hasTouch: script.includes('mobile') });
await page.route('https://cdn.jsdelivr.net/npm/three@0.147.0/**', r => { const rel = r.request().url().split('three@0.147.0/')[1]; r.fulfill({ path: path.join(three, rel), contentType: 'text/javascript' }) });
await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
const logs = []; page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 400)) }); page.on('pageerror', e => logs.push('PAGEERROR ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
await page.goto(`http://localhost:${port}/`);
await page.waitForTimeout(2500);
const t0 = Date.now();
for (const step of script.split(';').filter(Boolean)) {
  const [cmd, a, b] = step.split(':');
  if (cmd === 'lab') await page.click('#tabLab');
  else if (cmd === 'world') { await page.click('#tabWorld'); await page.waitForTimeout(1500); }
  else if (cmd === 'wait') await page.waitForTimeout(+a);
  else if (cmd === 'shot') await page.screenshot({ path: path.join(outdir, a + '.png'), timeout: 120000 });
  else if (cmd === 'key') { await page.keyboard.press(a); await page.waitForTimeout(+(b || 400)); }
  else if (cmd === 'walk') { await page.keyboard.down(a); await page.waitForTimeout(+b * 1000); await page.keyboard.up(a); }
  else if (cmd === 'click') { await page.click(a).catch(e => logs.push('click fail ' + a)); await page.waitForTimeout(+(b || 400)); }
  else if (cmd === 'eval') { const r = await page.evaluate(a.replace(/§/g, ':').replace(/¦/g, ';')).catch(e => 'ERR ' + e.message); logs.push('eval> ' + JSON.stringify(r)?.slice(0, 600)); }
  else if (cmd === 'js') { const r = await page.evaluate(fs.readFileSync(a, 'utf8')).catch(e => 'ERR ' + e.message); logs.push('js> ' + JSON.stringify(r)?.slice(0, 1500)); if (b) await page.waitForTimeout(+b); }
  else if (cmd === 'type') { await page.keyboard.type(a); }
  else if (cmd === 'reload') { await page.reload(); await page.waitForTimeout(2500); }
  else if (cmd === 'nick') { await page.evaluate(() => { const k='cyborg-labor-spiel-v3'; const v=JSON.parse(localStorage.getItem(k)||'{}'); v.nick='Testi'; localStorage.setItem(k, JSON.stringify(v)) }); await page.reload(); await page.waitForTimeout(2500); }
  else if (cmd === 'low') { await page.evaluate(() => localStorage.setItem('cyborg-labor-grafik', JSON.stringify('schnell'))); await page.reload(); await page.waitForTimeout(2500); }
}
const fps = await page.evaluate(() => new Promise(r => { let n = 0; const t = performance.now(); const f = () => { n++; if (performance.now() - t < 2000) requestAnimationFrame(f); else r(n / 2) }; requestAnimationFrame(f) }));
console.log(JSON.stringify({ ms: Date.now() - t0, fps, logs: [...new Set(logs)].slice(0, 60) }, null, 1));
await browser.close(); srv.close();
