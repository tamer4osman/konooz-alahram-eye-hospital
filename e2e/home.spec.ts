import { expect, test } from '@playwright/test';
import { collectConsoleErrors } from './helpers';

test('root redirects to the detected locale path', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/(ar|en)$/);
});

test('legacy ?lang= deep links still land on the right locale', async ({
  page,
}) => {
  await page.goto('/?lang=en');
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('renders Arabic RTL homepage by default with DB-backed content', async ({
  page,
}) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto('/ar');
  await expect(page).toHaveTitle(/كنوز/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#btn-lang-ar')).toBeVisible();

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('main, body').first()).toContainText(/كنوز الأهرام/);

  expect(consoleErrors).toEqual([]);
});

test('?lang=en switches to English LTR', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#btn-lang-en')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /Konooz|Eye/i
  );

  expect(consoleErrors).toEqual([]);
});

test('header toggle navigates between locale paths and flips direction', async ({
  page,
}) => {
  await page.goto('/ar');

  await page.locator('#btn-lang-en').click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

  await page.locator('#btn-lang-ar').click();
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('google maps embed is not blocked by CSP', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto('/en');
  const mapFrame = page.frameLocator('iframe[src*="maps.google.com"]');
  await expect(mapFrame.locator('body')).toBeAttached({ timeout: 10_000 });

  expect(consoleErrors).not.toContain(/Content Security Policy/);
});

test('custom 404 page serves for unknown paths in both locales', async ({
  page,
}) => {
  await page.goto('/en/this-route-does-not-exist');
  await expect(page.getByText('Page not found')).toBeVisible();

  await page.goto('/ar/also-missing');
  await expect(
    page.getByRole('heading', { name: 'الصفحة غير موجودة' })
  ).toBeVisible();
});
