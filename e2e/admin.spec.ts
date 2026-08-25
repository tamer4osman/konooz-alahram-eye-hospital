import { expect, test } from '@playwright/test';

const ADMIN_EMAIL = 'staff@konooz.test';
const ADMIN_PASSWORD = 'Staff@12345';

test.use({
  extraHTTPHeaders: {
    'X-Forwarded-For': `192.0.2.${Math.floor(Math.random() * 200) + 10}`,
  },
});

async function adminSessionCookie(request: any): Promise<{ name: string; value: string }> {
  const login = await request.post('/api/auth/login', {
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

  await page.goto('/');
  await page.locator('#btn-nav-dashboard').click();

  await expect(page.getByText(ADMIN_EMAIL).first()).toBeVisible({
    timeout: 20_000,
  });
});

test('non-admin cannot reach the dashboard', async ({ page }) => {
  await page.goto('/');

  await page.locator('#btn-nav-dashboard').click();

  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
});
