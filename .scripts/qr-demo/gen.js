const QRCode = require('qrcode');
const fs = require('fs');
const mongoose = require('D:/Coding_stuff/Projects/TrueTaste/server/node_modules/mongoose');

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/truetaste');
  const QR = mongoose.connection.collection('qrcodes');
  const R = mongoose.connection.collection('restaurants');

  const cities = ['Lahore', 'Islamabad', 'Karachi'];
  const cards = [];
  for (const city of cities) {
    const rs = await R.find({ city }).sort({ rating: -1 }).limit(3).toArray();
    for (const r of rs) {
      const q = (await QR.find({ restaurantId: r._id, active: true }).sort({ tableNumber: 1 }).limit(1).toArray())[0];
      if (!q) continue;
      const table = q.tableNumber;
      const payload = q.code || `TT-${r._id.toString()}-${table}`;
      cards.push({ name: r.name, city, table, payload });
    }
  }
  await mongoose.disconnect();

  for (const c of cards) {
    const file = `qr-${c.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
    c.file = file;
    await QRCode.toFile(file, c.payload, { width: 1024, margin: 3, errorCorrectionLevel: 'M', color: { dark: '#111827', light: '#FFFFFF' } });
    console.log(`generated ${file}  ${c.city} T${c.table}  payload=${c.payload}`);
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>TrueTaste - QR Demo Cards</title>
<style>
body{background:#0f172a;color:#e2e8f0;font-family:ui-sans-serif,system-ui,sans-serif;padding:40px;text-align:center}
h1{color:#f59e0b;letter-spacing:.02em}
.grid{display:flex;flex-wrap:wrap;gap:32px;justify-content:center;margin-top:24px}
.card{background:#fff;border-radius:24px;padding:28px;width:460px;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.card img{width:100%;image-rendering:pixelated}
.card .name{font-size:26px;font-weight:800;color:#111827;margin-top:16px}
.card .sub{font-size:18px;color:#4b5563;margin-top:4px}
.card .code{font-size:15px;color:#111827;background:#f3f4f6;border-radius:8px;padding:10px;margin:16px 0 8px;word-break:break-all;font-family:ui-monospace,monospace}
.hint{color:#94a3b8;margin-top:36px;font-size:17px}
</style></head><body>
<h1>TrueTaste - Scan a QR to write a review</h1>
<div class="grid">
${cards.map(c => `<div class="card"><img src="${c.file}"><div class="name">${c.name}</div><div class="sub">${c.city} · Table ${c.table}</div><div class="code">${c.payload}</div></div>`).join('\n')}
</div>
<p class="hint">Open in your browser on this PC and scan with the TrueTaste app (logged in as demo@truetaste.app).</p>
</body></html>`;
  fs.writeFileSync('index.html', html);
  console.log('wrote index.html');
})().catch((e) => { console.error(e); process.exit(1); });