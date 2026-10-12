// Sammelt alle sichtbaren deutschen Texte aus dem Spielcode für die Sprachpakete.
// Aufruf: node tools/i18n-extract.mjs <acorn-pfad> > lang/de.json
// Ergebnis: {strings:[...], templates:[...]}; Vorlagen haben Platzhalter {0}, {1} … für Zahlen und Namen.
import fs from 'node:fs'; import path from 'node:path';
const acornDir = process.argv[2] || '/tmp/claude-0/tk/node_modules';
const acorn = await import(path.join(acornDir, 'acorn/dist/acorn.mjs'));
const walk = await import(path.join(acornDir, 'acorn-walk/dist/walk.mjs'));
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const files = [...fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js') && f !== 'i18n.js').map(f => 'js/' + f),
  ...fs.readdirSync(path.join(root, 'js/planets')).filter(f => f.endsWith('.js')).map(f => 'js/planets/' + f)];
/* Aufrufe, deren Text-Argumente nie angezeigt werden */
const SKIP_CALLS = new Set(['play','jingle','querySelector','querySelectorAll','getElementById','getItem','setItem','removeItem','add','remove','toggle','contains','setAttribute','getAttribute','hasAttribute','removeAttribute','addEventListener','removeEventListener','createElement','kitMesh','mesh','swap','use','N','IT','F','B','REL','furn','nat','PLANETKIT','find','includes','indexOf','startsWith','endsWith','split','join','replace','match','test','get','has','delete','load','fetch','warn','log','error','info','debug','dress','toonTex','ctex','glowTex','makeMats','skinMaterial','set','emit','on','join','want','tryPut','pick','rr','wantTag','closest','matches','dispatchEvent','postMessage','ani','anim','pose','say_','sfx','voice']);
const strings = new Set(), templates = new Set();
const visible = s => {
  if (!s || s.length < 2) return false;
  if (!/[A-Za-zÄÖÜäöüß]{2}/.test(s)) return false;
  if (/^[a-z0-9_\-]+$/.test(s)) return false;                 // ids
  if (/^#[0-9a-fA-F]{3,8}$/.test(s)) return false;            // Farben
  if (/[{};<>=]|^\s*(rgba?|hsla?|url|var)\(|\d+px|\bpx\b|^\.|^[#.][\w-]+[ ,>]/.test(s)) return false;
  if (/^(js|lang|tools|vendor)\/|^https?:|^data:|\.(png|jpg|mp3|ogg|glb|gltf|json|js|css)$/.test(s)) return false;
  if (/^(bold|900|800|700|600|500|italic|normal)\s/.test(s)) return false; // Schriften
  if (/^[a-z]+([A-Z][a-z0-9]*)+$/.test(s)) return false;      // camelCase
  if (/^[\w|:\/.-]+$/.test(s) && !/[A-ZÄÖÜ]/.test(s[0]) && !/[äöüß]/.test(s)) return false;
  if (/_/.test(s) && !/\s/.test(s)) return false;
  return true;
};
function calleeName(n) { const c = n.callee; return c.type === 'Identifier' ? c.name : c.type === 'MemberExpression' && !c.computed ? c.property.name : ''; }
function flatten(node, out) { // a+b+c → Liste von Teilen
  if (node.type === 'BinaryExpression' && node.operator === '+') { flatten(node.left, out); flatten(node.right, out); } else out.push(node); return out; }
for (const f of files) {
  const src = fs.readFileSync(path.join(root, f), 'utf8'); let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true }); } catch (e) { console.error('parse', f, e.message); continue; }
  const skip = new Set();
  walk.fullAncestor(ast, (node, st, anc) => {
    const parent = anc[anc.length - 2];
    if (node.type === 'Literal' && typeof node.value === 'string') {
      if (skip.has(node)) return;
      if (parent && parent.type === 'Property' && parent.key === node) return;
      if (parent && parent.type === 'MemberExpression' && parent.property === node) return;
      if (parent && parent.type === 'BinaryExpression' && /^[!=]==?$/.test(parent.operator)) return;
      if (parent && parent.type === 'SwitchCase') return;
      if (parent && parent.type === 'CallExpression' && parent.arguments.includes(node) && SKIP_CALLS.has(calleeName(parent)) && parent.arguments[0] === node) return;
      if (visible(node.value)) strings.add(node.value.trim() ? node.value : node.value);
    }
    if (node.type === 'BinaryExpression' && node.operator === '+' && !(parent && parent.type === 'BinaryExpression' && parent.operator === '+')) {
      const parts = flatten(node, []); if (!parts.some(p => p.type === 'Literal' && typeof p.value === 'string' && /[A-Za-zÄÖÜäöüß]{2}/.test(p.value))) return;
      let tpl = '', k = 0, lit = 0; for (const p of parts) { if (p.type === 'Literal' && typeof p.value === 'string') { tpl += p.value; lit += p.value.length; skip.add(p); } else if (p.type === 'TemplateLiteral' && !p.expressions.length) { tpl += p.quasis[0].value.cooked; } else tpl += '{' + (k++) + '}'; }
      if (k && lit >= 3 && visible(tpl.replace(/\{\d+\}/g, ''))) templates.add(tpl); else if (!k && visible(tpl)) strings.add(tpl);
    }
    if (node.type === 'TemplateLiteral') {
      let tpl = ''; node.quasis.forEach((q, i) => { tpl += q.value.cooked; if (i < node.expressions.length) tpl += '{' + i + '}'; });
      if (node.expressions.length ? visible(tpl.replace(/\{\d+\}/g, '')) : visible(tpl)) (node.expressions.length ? templates : strings).add(tpl);
    }
  });
}
/* Vorlagen, deren fester Text nur aus Satzzeichen besteht, helfen nicht */
const T = [...templates].filter(t => t.replace(/\{\d+\}/g, '').replace(/[^A-Za-zÄÖÜäöüß]/g, '').length >= 3);
process.stdout.write(JSON.stringify({ strings: [...strings].sort(), templates: T.sort() }, null, 0));
