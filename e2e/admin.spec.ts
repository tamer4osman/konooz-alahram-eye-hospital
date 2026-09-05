import { expect, test } from '@playwright/test';

// Credentials come from the environment (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD,
// shared with scripts/seed-staff.ts). Nothing is hardcoded here. The specs skip
// when the vars are absent so the rest of the suite still runs.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? '';

test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD missing — set them in .env to run the admin specs');

test.use({
  extraHTTPHeaders: {
    'X-Forwarded-For': `192.0.2.${Math.floor(Math.random() * 200) + 10}`,
  },
});

async function adminSessionCookie(request: any): Promise<{ name: string; value: string }> {
  const login = await request.post('/api/staff/auth/login', {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(login.status()).toBe(200);
  const raw = login.headers()['set-cookie'] ?? '';
  const pair = raw.split(';')[0];
  const eq = pair.indexOf('=');
  return { name: pair.slice(0, eq), value: pair.slice(eq + 1) };
}

test('admin session unlocks the operations dashboard', async ({
  page,
  request,
}) => {
  const cookie = await adminSessionCookie(request);
  await page.context().addCookies([
    {
      ...cookie,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    },
  ]);

  await page.goto('/en/ops');

  await expect(page.getByText(ADMIN_EMAIL).first()).toBeVisible({
    timeout: 20_000,
  });
});

test('unauthenticated visitor is stopped at the staff login gate', async ({ page }) => {
  await page.goto('/en/ops');

  await expect(
    page.getByRole('heading', { name: /Operations Hub/ }),
  ).toBeVisible({ timeout: 15_000 });
});
