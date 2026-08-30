// ponytail: QA regression sweep — hits every read endpoint with the demo token
// and reports non-2xx. Writes are skipped (they mutate demo data; tested in-app).
const BASE = process.env.API_URL || 'http://127.0.0.1:5000/api';

async function main() {
  const login = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@truetaste.app', password: 'demo123' }),
  });
  const { token } = await login.json();
  const H = { Authorization: `Bearer ${token}` };

  const rest = await fetch(`${BASE}/restaurants`, { headers: H });
  const rid = (await rest.json()).restaurants?.[0]?._id;

  const routes = [
    ['GET /health', `${BASE}/health`, {}],
    ['GET /auth/me', `${BASE}/auth/me`, H],
    ['GET /restaurants', `${BASE}/restaurants`, H],
    ['GET /restaurants/search?q=chicken', `${BASE}/restaurants/search?q=chicken`, H],
    ['GET /restaurants/dish-search?q=biryani', `${BASE}/restaurants/dish-search?q=biryani`, H],
    ['GET /restaurants/:id', `${BASE}/restaurants/${rid}`, H],
    ['GET /restaurants/:id/reviews', `${BASE}/restaurants/${rid}/reviews`, H],
    ['GET /reviews/restaurant/:id/summary', `${BASE}/reviews/restaurant/${rid}/summary`, H],
    ['GET /reviews/restaurant/:id/analytics', `${BASE}/reviews/restaurant/${rid}/analytics`, H],
    ['GET /reviews/my', `${BASE}/reviews/my`, H],
    ['GET /rewards', `${BASE}/rewards`, H],
    ['GET /rewards/transactions', `${BASE}/rewards/transactions`, H],
    ['GET /recommendations', `${BASE}/recommendations`, H],
    ['GET /users/me', `${BASE}/users/me`, H],
    ['GET /users/favorites', `${BASE}/users/favorites`, H],
  ];

  let bad = 0;
  for (const [label, url, headers] of routes) {
    const res = await fetch(url, { headers });
    const ok = res.status < 400;
    if (!ok) bad++;
    console.log(`${ok ? '  OK' : 'FAIL'}  ${res.status}  ${label}`);
  }
  console.log(bad === 0 ? '\nAll endpoints healthy.' : `\n${bad} endpoint(s) failed.`);
  process.exit(bad === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('sweep failed:', e.message);
  process.exit(1);
});