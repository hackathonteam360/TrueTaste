import app from './app';
import { connectDB } from './config/db';
import { env, checkEnv } from './config/env';

async function start() {
  const missing = checkEnv();
  if (missing.length) {
    console.warn('[server] Environment check: some variables are not set.');
    for (const m of missing) console.warn(`  - ${m.key}: ${m.hint}`);
  }

  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] TrueTaste API running on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
