/**
 * One-time migration: copy all TrueTaste collections from a source Mongo URI
 * into a target Mongo URI, preserving document _id values so cross-references
 * (reviews.restaurantId, cointransactions.userId, etc.) stay intact.
 *
 * Usage (from server/):
 *   MIGRATE_SOURCE=mongodb://127.0.0.1:27017/truetaste \
 *   MIGRATE_TARGET=<atlas-connection-string> \
 *   node .scripts/migrate.mjs
 */
import { MongoClient } from 'mongodb';

const SOURCE = process.env.MIGRATE_SOURCE || 'mongodb://127.0.0.1:27017/truetaste';
const TARGET = process.env.MIGRATE_TARGET;

if (!TARGET) {
  console.error('Set MIGRATE_TARGET to the Atlas connection string.');
  process.exit(1);
}

const COLLECTIONS = [
  'users',
  'restaurants',
  'reviews',
  'rewards',
  'qrcodes',
  'cointransactions',
  'subscriptions',
];

const src = new MongoClient(SOURCE);
const dst = new MongoClient(TARGET);

async function main() {
  await src.connect();
  await dst.connect();
  const sdb = src.db();
  const tdb = dst.db();

  for (const name of COLLECTIONS) {
    const docs = await sdb.collection(name).find({}).toArray();
    if (docs.length === 0) {
      console.log(`  ${name}: 0 docs (skip)`);
      continue;
    }
    await tdb.collection(name).deleteMany({});
    const result = await tdb.collection(name).insertMany(docs);
    console.log(`  ${name}: ${docs.length} -> ${Object.keys(result.insertedIds).length}`);
  }

  console.log('Done.');
  await src.close();
  await dst.close();
}

main().catch(async (e) => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
