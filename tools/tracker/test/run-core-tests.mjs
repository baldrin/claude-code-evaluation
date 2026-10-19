// Automated tests for the tracker's core logic (storage, entries, attachments, reports, backups).
// Runs the exact <script id="core"> code from tracker.html against an in-memory file system
// that implements the same File System Access API the browser provides.
//   node tools/tracker/test/run-core-tests.mjs [path/to/tracker.html]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = process.argv[2] || path.join(here, '..', 'tracker.html');
const html = readFileSync(htmlPath, 'utf8');
const core = /<script id="core">\n([\s\S]*?)<\/script>/.exec(html)[1];
const catalog = JSON.parse(/<script id="catalog-data" type="application\/json">\n([\s\S]*?)\n<\/script>/.exec(html)[1]);

const ctx = vm.createContext({ crypto: globalThis.crypto, Blob, File, btoa, atob, TextEncoder, TextDecoder, console, encodeURI, Promise, Symbol });
vm.runInContext(core, ctx, { filename: 'tracker-core.js' });
const C = ctx.TrackerCore;

// ---- In-memory File System Access API ----
const err = (name, msg) => Object.assign(new Error(msg), { name });
class MemFile {
  constructor(name) { this.kind = 'file'; this.name = name; this.blob = new Blob([]); }
  async getFile() { return new File([this.blob], this.name, { type: this.blob.type }); }
  async createWritable() {
    const chunks = []; const self = this;
    return { async write(d) { chunks.push(d); }, async close() { self.blob = new Blob(chunks, { type: chunks[0] && chunks[0].type || '' }); } };
  }
}
class MemDir {
  constructor(name) { this.kind = 'directory'; this.name = name; this.children = new Map(); }
  async getDirectoryHandle(name, opts = {}) {
    const c = this.children.get(name);
    if (c) { if (c.kind !== 'directory') throw err('TypeMismatchError', name); return c; }
    if (!opts.create) throw err('NotFoundError', name);
    const d = new MemDir(name); this.children.set(name, d); return d;
  }
  async getFileHandle(name, opts = {}) {
    const c = this.children.get(name);
    if (c) { if (c.kind !== 'file') throw err('TypeMismatchError', name); return c; }
    if (!opts.create) throw err('NotFoundError', name);
    const f = new MemFile(name); this.children.set(name, f); return f;
  }
  async removeEntry(name, opts = {}) {
    const c = this.children.get(name);
    if (!c) throw err('NotFoundError', name);
    if (c.kind === 'directory' && c.children.size && !opts.recursive) throw err('InvalidModificationError', name);
    this.children.delete(name);
  }
  async *entries() { for (const [n, h] of this.children) yield [n, h]; }
}
function allPaths(dir, prefix = '') {
  const out = [];
  for (const [n, h] of dir.children) {
    const p = prefix ? `${prefix}/${n}` : n;
    if (h.kind === 'file') out.push(p); else out.push(...allPaths(h, p));
  }
  return out.sort();
}

// ---- tiny test runner ----
let pass = 0; const fails = [];
async function test(name, fn) {
  try { await fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fails.push(name); console.log(`  ✗ ${name}\n      ${e.stack || e}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m || 'not equal'}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };
const PNG = C.fromBase64('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
const today = C.dateStamp();
const fresh = async () => { const root = new MemDir('records'); const t = await new C.Tracker(new C.Store(root, 'records')).load(); return { root, t }; };

console.log(`Tracker core tests (${path.basename(htmlPath)}, ${catalog.length} catalog tests embedded)`);

await test('helpers: slugify, test IDs, extensions, escaping', () => {
  eq(C.slugify('Screenshot 2026-10-21 at 14.05.33'), 'screenshot-2026-10-21-at-14-05-33');
  eq(C.slugify('Ünïcode  /  Ümlauts!!'), 'unicode-umlauts');
  eq(C.slugify(''), 'file');
  eq(C.slugify('x'.repeat(80)).length, 48);
  eq(C.cleanTestId(' env-001 '), 'ENV-001');
  eq(C.cleanTestId('../ENV/001'), 'ENV001');
  eq(C.extOf('a.LOG', ''), 'log'); eq(C.extOf('', 'image/png'), 'png'); eq(C.extOf('noext', 'application/x-foo'), 'bin');
  eq(C.escapeHTML(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  assert(C.isImage({ name: 'a.png' }) && !C.isImage({ name: 'a.svg', type: 'image/svg+xml' }), 'svg must not be treated as an embeddable image');
  assert(C.isText({ name: 'out.log' }) && C.isText({ name: 'x', type: 'application/json' }));
});

await test('catalog embedded: 213 tests, 73 P0, unique IDs', () => {
  eq(catalog.length, 213, 'catalog size'); eq(catalog.filter((t) => t.pri === 'P0').length, 73, 'P0 count');
  eq(new Set(catalog.map((t) => t.id)).size, catalog.length, 'duplicate IDs');
  assert(catalog.every((t) => t.title && t.domain && /^P[0-2]$/.test(t.pri)), 'malformed catalog row');
});

await test('new project creates tracker.json; sections add/rename/move/delete', async () => {
  const { root, t } = await fresh();
  assert(allPaths(root).includes('tracker.json'));
  const a = await t.addSection('Alpha'); const b = await t.addSection('  Beta  ');
  eq(b.name, 'Beta');
  await t.renameSection(a.id, 'Alpha 2'); await t.moveSection(b.id, -1);
  eq(t.project.sections.map((s) => s.name).join(','), 'Beta,Alpha 2');
  const t2 = await new C.Tracker(t.store).load();
  eq(t2.project.sections.map((s) => s.name).join(','), 'Beta,Alpha 2', 'sections persisted');
  await t.newEntry(a.id, { title: 'x' });
  let threw = false; try { await t.deleteSection(a.id); } catch (e) { threw = true; }
  assert(threw, 'deleting a non-empty section must fail');
  await t.deleteSection(b.id); eq(t.project.sections.length, 1);
  const added = await t.addStandardSections(); eq(added.length, 13);
  eq((await t.addStandardSections()).length, 0, 'standard sections are not duplicated');
});

await test('entries persist with every field; defaults applied', async () => {
  const { t } = await fresh();
  t.project.defaults.claudeVersion = '2.1.301'; t.project.defaults.tester = 'eval lead';
  const s = await t.addSection('ENV');
  const e = await t.newEntry(s.id, { title: 'Hyper-V check', testId: 'env-001' });
  Object.assign(e, { status: 'blocker', whatIDid: 'ran systeminfo', result: 'no VT-x', fixSteps: '[t] asked platform', notes: 'n', privateNotes: 'secret-ish' });
  await t.saveEntry(e); await t.idle();
  const t2 = await new C.Tracker(t.store).load(); const e2 = t2.entries.get(e.id);
  eq(e2.testId, 'ENV-001'); eq(e2.status, 'blocker'); eq(e2.env.claudeVersion, '2.1.301'); eq(e2.env.tester, 'eval lead');
  for (const k of ['whatIDid', 'result', 'fixSteps', 'notes', 'privateNotes']) eq(e2[k], e[k], k);
});

await test('rapid saves are serialized; last write wins', async () => {
  const { t } = await fresh(); const s = await t.addSection('S'); const e = await t.newEntry(s.id);
  for (let i = 0; i < 25; i++) { e.result = `v${i}`; t.saveEntry(e); }
  await t.idle();
  const e2 = (await new C.Tracker(t.store).load()).entries.get(e.id);
  eq(e2.result, 'v24');
});

await test('attachments: naming, collisions, folder by test ID', async () => {
  const { root, t } = await fresh(); const s = await t.addSection('S');
  const e = await t.newEntry(s.id);
  const a1 = await t.addAttachment(e, new Blob([PNG], { type: 'image/png' }), { name: 'screenshot.png' });
  const a2 = await t.addAttachment(e, new Blob([PNG], { type: 'image/png' }), { name: 'screenshot.png' });
  const a3 = await t.addAttachment(e, new Blob(['log line\n'], { type: 'text/plain' }), { name: 'Curl Output.LOG', caption: 'Curl blocked' });
  eq(a1.path, `evidence/_entries/${e.id}/${today}-screenshot.png`);
  eq(a2.path, `evidence/_entries/${e.id}/${today}-screenshot-2.png`);
  eq(a3.path, `evidence/_entries/${e.id}/${today}-curl-blocked.log`, 'caption drives the slug');
  eq(a3.original, 'Curl Output.LOG');
  const e2 = await t.newEntry(s.id, { testId: 'SBX-004' });
  const b1 = await t.addAttachment(e2, new Blob(['x']), { name: 'proof.txt' });
  eq(b1.path, `evidence/SBX-004/${today}-proof.txt`);
  assert(allPaths(root).includes(`evidence/SBX-004/${today}-proof.txt`));
  const f = await t.readAttachment(a1); eq((await f.arrayBuffer()).byteLength, PNG.length, 'bytes preserved');
});

await test('setting a test ID moves attachments; removing it moves them back', async () => {
  const { root, t } = await fresh(); const s = await t.addSection('S'); const e = await t.newEntry(s.id);
  await t.addAttachment(e, new Blob(['a']), { name: 'one.txt' });
  await t.addAttachment(e, new Blob(['b']), { name: 'two.png', }).catch(() => {});
  await t.setTestId(e, 'net-014');
  assert(e.attachments.every((a) => a.path.startsWith('evidence/NET-014/')), 'not moved');
  assert(!allPaths(root).some((p) => p.includes('_entries')), 'old files left behind');
  await t.setTestId(e, '');
  assert(e.attachments.every((a) => a.path.startsWith(`evidence/_entries/${e.id}/`)), 'not moved back');
  eq(allPaths(root).filter((p) => p.startsWith('evidence/')).length, 2);
});

await test('two entries with the same test ID never overwrite each other\'s files', async () => {
  const { t } = await fresh(); const s = await t.addSection('S');
  const e1 = await t.newEntry(s.id, { testId: 'ENV-006' }); const e2 = await t.newEntry(s.id, { testId: 'ENV-006' });
  const a = await t.addAttachment(e1, new Blob(['first']), { name: 'run.log' });
  const b = await t.addAttachment(e2, new Blob(['second']), { name: 'run.log' });
  assert(a.path !== b.path, 'same path reused');
  eq(await (await t.readAttachment(a)).text(), 'first'); eq(await (await t.readAttachment(b)).text(), 'second');
});

await test('removing an attachment and deleting an entry clean up files', async () => {
  const { root, t } = await fresh(); const s = await t.addSection('S'); const e = await t.newEntry(s.id, { testId: 'OPS-003' });
  const a = await t.addAttachment(e, new Blob(['1']), { name: 'a.txt' }); await t.addAttachment(e, new Blob(['2']), { name: 'b.txt' });
  const keep = await t.newEntry(s.id, { testId: 'OPS-003' }); await t.addAttachment(keep, new Blob(['k']), { name: 'keep.txt' });
  await t.removeAttachment(e, a.id);
  assert(!allPaths(root).includes(a.path)); eq(e.attachments.length, 1);
  await t.deleteEntry(e.id);
  const paths = allPaths(root);
  assert(!paths.includes(`entries/${e.id}.json`), 'entry JSON left'); assert(!paths.some((p) => p.endsWith('b.txt')), 'attachment left');
  assert(paths.some((p) => p.endsWith('keep.txt')), 'deleted another entry\'s file');
});

await test('HTML report: private notes never included, text escaped, images embedded, logs inlined', async () => {
  const { t } = await fresh(); const s = await t.addSection('Network <egress>');
  const canary = 'PRIVATE-CANARY-7f3a';
  const e = await t.newEntry(s.id, { title: 'Firewall <b>holds</b>', testId: 'NET-014', status: 'pass',
    result: 'blocked\n<img src=x onerror=alert(1)>', privateNotes: canary });
  await t.addAttachment(e, new Blob([PNG], { type: 'image/png' }), { name: 'shot.png', caption: 'curl blocked' });
  await t.addAttachment(e, new Blob(['curl: (7) Failed to connect\n'], { type: 'text/plain' }), { name: 'curl.log' });
  await t.addAttachment(e, new Blob(['<svg onload=alert(1)>'], { type: 'image/svg+xml' }), { name: 'evil.svg' });
  e.attachments[0].caption = `caption ${canary.slice(0, 3)}`; // caption is public by design
  const html = await C.buildReportHTML(t, {}, catalog);
  assert(!html.includes(canary), 'private note leaked');
  assert(!html.includes('<img src=x onerror'), 'unescaped HTML from a text field');
  assert(!html.includes('<svg onload'), 'SVG content was inlined');
  assert(html.includes('Firewall &lt;b&gt;holds&lt;/b&gt;'), 'title not escaped');
  assert(html.includes('Network &lt;egress&gt;'), 'section name not escaped');
  assert(html.includes('data:image/png;base64,'), 'image not embedded');
  assert(html.includes('curl: (7) Failed to connect'), 'log not inlined');
  assert(html.includes("default-src 'none'"), 'report CSP missing');
  assert(!/<script/i.test(html.replace(/&lt;script/gi, '')), 'report contains a script tag');
  assert(html.includes('Container firewall holds on an internet-connected host'), 'catalog title missing');
  const noEmbed = await C.buildReportHTML(t, { embedImages: false, includeLogs: false }, catalog);
  assert(!noEmbed.includes('data:image/png;base64,') && !noEmbed.includes('Failed to connect'), 'options ignored');
});

await test('report filters by section and status; unsorted entries included', async () => {
  const { t } = await fresh(); const a = await t.addSection('A'); const b = await t.addSection('B');
  await t.newEntry(a.id, { title: 'a-pass', status: 'pass' }); await t.newEntry(a.id, { title: 'a-block', status: 'blocker' });
  await t.newEntry(b.id, { title: 'b-issue', status: 'issue' }); await t.newEntry('missing-section', { title: 'orphan', status: 'pass' });
  const onlyA = await C.buildReportHTML(t, { sections: [a.id] }, []);
  assert(onlyA.includes('a-pass') && !onlyA.includes('b-issue') && !onlyA.includes('orphan'));
  const flagged = await C.buildReportHTML(t, { statuses: ['blocker', 'issue'] }, []);
  assert(flagged.includes('a-block') && flagged.includes('b-issue') && !flagged.includes('a-pass'));
  const all = await C.buildReportHTML(t, {}, []);
  assert(all.includes('orphan') && all.includes('Unsorted'), 'orphan entries missing');
  const md = C.buildReportMarkdown(t, { statuses: ['blocker'] }, []);
  assert(md.includes('a-block') && !md.includes('a-pass'));
});

await test('Markdown report: private notes excluded, relative links to evidence', async () => {
  const { t } = await fresh(); const s = await t.addSection('S');
  const e = await t.newEntry(s.id, { title: 'MD', testId: 'ENV-016', status: 'issue', whatIDid: 'built image', privateNotes: 'MD-CANARY-1' });
  await t.addAttachment(e, new Blob([PNG], { type: 'image/png' }), { name: 'build.png' });
  await t.addAttachment(e, new Blob(['log']), { name: 'build log.txt' });
  const md = C.buildReportMarkdown(t, {}, catalog);
  assert(!md.includes('MD-CANARY-1'), 'private note leaked');
  assert(md.includes(`](../evidence/ENV-016/${today}-build.png)`) && md.includes(`![${today}-build.png]`), 'image link wrong:\n' + md.split('\n').filter((l) => l.includes('evidence')).join('\n'));
  assert(md.includes(`(../evidence/ENV-016/${today}-build-log.txt)`), 'file link wrong');
  assert(md.includes('#### What I did'), 'field heading missing');
});

await test('coverage uses the latest entry per test ID', async () => {
  const { t } = await fresh(); const s = await t.addSection('S');
  const old = await t.newEntry(s.id, { testId: 'ENV-001', status: 'blocker' });
  old.updatedAt = '2026-01-01T00:00:00.000Z'; await t.saveEntry(old, false);
  await t.newEntry(s.id, { testId: 'ENV-001', status: 'pass' });
  await t.newEntry(s.id, { testId: 'ENV-002', status: 'notrun' });
  await t.newEntry(s.id, { testId: 'XYZ-999', status: 'pass' });
  const cov = C.coverage(catalog, t.allEntries());
  eq(cov.p0.tested, 1, 'P0 tested'); eq(cov.p0.pass, 1); eq(cov.p0.blocker, 0, 'old blocker must not count');
  eq(cov.byDomain.ENV.p0tested, 1); eq(cov.p0.total, 73); eq(cov.untestedP0.length, 72);
  eq(cov.unknownIds.join(), 'XYZ-999');
});

await test('Markdown neutralises raw HTML but keeps code blocks and inline code', async () => {
  eq(C.mdSafe('a <script>x</script> & b'), 'a &lt;script&gt;x&lt;/script&gt; &amp; b');
  eq(C.mdSafe('run `cat <file>` now'), 'run `cat <file>` now');
  eq(C.mdSafe('```\n<html>\n```\n<b>'), '```\n<html>\n```\n&lt;b&gt;');
  const { t } = await fresh(); const s = await t.addSection('Inj <img src=x onerror=1>');
  await t.newEntry(s.id, { title: 'Drill <svg onload=1>', result: 'payload: <script>fetch(1)</script>\n```\n<kept>\n```' });
  const md = C.buildReportMarkdown(t, {}, []);
  assert(!/<(script|svg|img)\b/i.test(md), 'raw HTML in Markdown:\n' + md);
  assert(md.includes('<kept>'), 'fenced code was altered');
});

await test('coverage lists domains in catalog order', () => {
  const cov = C.coverage(catalog, []);
  eq(Object.keys(cov.byDomain).join(','), 'ENV,POL,PERM,SBX,NET,IDN,DATA,EXT,TEL,COST,FEAT,SURF,OPS');
});

await test('backup and restore round-trip (including private notes and bytes)', async () => {
  const { t } = await fresh(); const s = await t.addSection('S');
  const e = await t.newEntry(s.id, { testId: 'IDN-002', privateNotes: 'kept in backups' });
  await t.addAttachment(e, new Blob([PNG], { type: 'image/png' }), { name: 'x.png' });
  const text = await C.exportBackup(t);
  const { root: r2, t: t2 } = await fresh();
  const res = await C.importBackup(t2, text);
  eq(res.entries, 1); eq(res.files, 1);
  const e2 = (await new C.Tracker(t2.store).load()).entries.get(e.id);
  eq(e2.privateNotes, 'kept in backups');
  eq((await (await t2.readAttachment(e2.attachments[0])).arrayBuffer()).byteLength, PNG.length);
  assert(allPaths(r2).includes(e.attachments[0].path));
  let threw = false; try { await C.importBackup(t2, '{"format":"nope"}'); } catch (x) { threw = true; } assert(threw, 'bad backup accepted');
  const evil = JSON.stringify({ format: 'evaluation-tracker-backup', project: { sections: [] }, entries: [], files: { '../escape.txt': 'eA==', '/abs.txt': 'eA==' } });
  eq((await C.importBackup(t2, evil)).files, 0, 'path traversal in backup');
});

await test('corrupt entry files are reported, not fatal', async () => {
  const { t } = await fresh(); const s = await t.addSection('S'); await t.newEntry(s.id, { title: 'ok' });
  await t.store.writeFile('entries/broken.json', new Blob(['{not json']));
  const t2 = await new C.Tracker(t.store).load();
  eq(t2.entries.size, 1); eq(t2.loadErrors.length, 1);
});

await test('built-in self-test passes', async () => {
  const root = new MemDir('opfs');
  const results = await C.runSelfTest(root);
  const bad = results.filter((r) => !r.ok);
  assert(!bad.length, bad.map((r) => `${r.name}: ${r.detail}`).join('; '));
  eq(results.length, 10); eq(root.children.size, 0, 'scratch folder not cleaned up');
});

console.log(`\n${pass} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
