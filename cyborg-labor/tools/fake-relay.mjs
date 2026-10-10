// Kleiner Nostr-Relay im Testprozess (NIP-01: EVENT, REQ, CLOSE), für Tests ohne Internet.
// Alle wss://-Verbindungen eines Browser-Kontexts landen hier. Beide Test-Browser teilen sich den Speicher.
const events = []; const subs = new Set();
const match = (f, ev) => {
  if (f.ids && !f.ids.includes(ev.id)) return false;
  if (f.authors && !f.authors.includes(ev.pubkey)) return false;
  if (f.kinds && !f.kinds.includes(ev.kind)) return false;
  if (f.since && ev.created_at < f.since) return false;
  if (f.until && ev.created_at > f.until) return false;
  for (const k of Object.keys(f)) if (k[0] === '#') { const t = k.slice(1); if (!ev.tags.some(x => x[0] === t && f[k].includes(x[1]))) return false }
  return true;
};
export let relayStats = { events: 0, reqs: 0, sockets: 0 };
export async function fakeRelay(ctx) {
  await ctx.routeWebSocket(/^wss:\/\//, ws => {
    relayStats.sockets++; const mine = new Map();
    ws.onMessage(raw => {
      let m; try { m = JSON.parse(raw) } catch (e) { return }
      if (m[0] === 'EVENT') { const ev = m[1]; relayStats.events++; events.push(ev); if (events.length > 2000) events.shift(); ws.send(JSON.stringify(['OK', ev.id, true, ''])); for (const s of subs) if (s.filters.some(f => match(f, ev))) { try { s.ws.send(JSON.stringify(['EVENT', s.id, ev])) } catch (e) { } } }
      else if (m[0] === 'REQ') { relayStats.reqs++; const s = { id: m[1], filters: m.slice(2), ws }; mine.set(m[1], s); subs.add(s); for (const ev of events) if (s.filters.some(f => match(f, ev))) ws.send(JSON.stringify(['EVENT', s.id, ev])); ws.send(JSON.stringify(['EOSE', s.id])) }
      else if (m[0] === 'CLOSE') { const s = mine.get(m[1]); if (s) { subs.delete(s); mine.delete(m[1]) } }
    });
    ws.onClose(() => { for (const s of mine.values()) subs.delete(s) });
  });
}
