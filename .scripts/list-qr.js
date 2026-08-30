const mongoose = require("mongoose");
(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/truetaste");
  const QR = mongoose.connection.collection("qrcodes");
  const R = mongoose.connection.collection("restaurants");
  const ids = [
    "6a9302ee2b1d8211c7f46cb6",
    "6a9302ee2b1d8211c7f46cc5",
    "6a9302ee2b1d8211c7f46cd0",
    "6a9302ee2b1d8211c7f46cfc",
  ];
  const oids = ids.map((x) => new mongoose.Types.ObjectId(x));
  const qs = await QR.find({ restaurantId: { $in: oids } }).toArray();
  const rs = await R.find({ _id: { $in: oids } }).toArray();
  const nm = {};
  for (const r of rs) nm[r._id.toString()] = r.name;
  const byr = {};
  for (const q of qs) {
    const k = q.restaurantId.toString();
    (byr[k] = byr[k] || []).push(q.tableNumber);
  }
  for (const id of ids) console.log(nm[id], JSON.stringify(byr[id] || "NO QR"));
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });