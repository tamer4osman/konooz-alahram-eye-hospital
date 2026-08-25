import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from './helpers';

test('renders Arabic RTL homepage by default with DB-backed content', async ({
  page,
}) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto('/');
  await expect(page).toHaveTitle(/كنوز|Konooz/i);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#btn-lang-ar')).toBeVisible();

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('main, body').first()).toContainText(/كنوز الأهرام/);

  expect(consoleErrors).toEqual([]);
});

test('?lang=en switches to English LTR', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto('/?lang=en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#btn-lang-en')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /Konooz|Eye/i
  );

  expect(consoleErrors).toEqual([]);
});

test('google maps embed is not blocked by CSP', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto('/');
  const mapFrame = page.frameLocator('iframe[src*="maps.google.com"]');
  await expect(mapFrame.locator('body')).toBeAttached({ timeout: 10_000 });

  expect(consoleErrors).not.toContain(/Content Security Policy/);
});

test('custom 404 page serves for unknown routes in both languages', async ({
  page,
}) => {
  await page.goto('/this-route-does-not-exist');
  await expect(
    page.getByRole('heading', { name: 'الصفحة غير موجودة' })
  ).toBeVisible();

  await page.goto('/also-missing?lang=en');
  await expect(page.getByText('Page not found')).toBeVisible();
});
