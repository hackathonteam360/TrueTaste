import fs from 'node:fs';
import path from 'node:path';
const raw = fs.readFileSync('D:/Coding_stuff/Projects/TrueTaste/.scripts/screens.txt', 'utf8').replace(/^\uFEFF/, '');
const data = JSON.parse(raw);
const out = 'D:/Coding_stuff/Projects/TrueTaste/design-demo/screens';
fs.mkdirSync(out, { recursive: true });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
for (const sc of data.screens) {
  if (!sc.htmlCode || !sc.htmlCode.downloadUrl) continue;
  const fn = path.join(out, slug(sc.title) + '.html');
  try {
    const res = await fetch(sc.htmlCode.downloadUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(fn, buf);
    console.log('OK', sc.title, buf.length, 'bytes');
  } catch (e) { console.log('FAIL', sc.title, e.message); }
}
