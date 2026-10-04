// Kontaktbogen rendern: node tools/render.mjs <slot> <out.png> [query-extra]
// Beispiel: node tools/render.mjs kopf /tmp/k.png "from=0&n=24&mode=part"
// Startet einen eigenen kleinen Static-Server auf einem freien Port.
import { chromium } from '/tmp/claude-0/tk/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const [slot = 'kopf', out = '/tmp/sheet.png', extra = ''] = process.argv.slice(2);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.mp3': 'audio/mpeg', '.json': 'application/json', '.css': 'text/css' };
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(p, (e, b) => { if (e) { s.writeHead(404); s.end(); return } s.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); s.end(b) }) });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: 1 });
const logs = []; page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.text()) }); page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
await page.goto(`http://localhost:${port}/tools/${slot.startsWith("gallery")?"gallery.html?":slot==="fauna"?"fauna.html?":slot==="town"?"town.html?":slot==="arch"?"arch.html?":slot==="kit"?"kit.html?":slot==="bau"?"bau.html?":slot==="haus"?"haus.html?":slot==="mouth"?"mouth.html?":slot==="mouthcount"?"mouthcount.html?":slot==="torso"?"torso.html?":"harness.html?slot="+slot+"&"}${extra}`);
await page.waitForFunction(() => window.__done, null, { timeout: 180000 });
const res = await page.evaluate(() => window.__done);
await page.waitForTimeout(300);
await page.screenshot({ path: out, fullPage: true });
console.log(JSON.stringify({ slot, rendered: res.count, totalInSlot: res.total, stats: res.stats, ms: res.ms, errors: res.errors.slice(0, 30), console: logs.filter(l => !/is not a property of this material|GPU stall|swiftshader|Automatic fallback/i.test(l)).map(l=>l.slice(0,600)).slice(0, 30) }, null, 1));
await browser.close(); srv.close();
