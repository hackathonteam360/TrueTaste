import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] TrueTaste API running on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});