import { expect, test } from '@playwright/test';

test('server-rendered specialty cards open modals via the client island', async ({
  page,
}) => {
  await page.goto('/en');

  const detailsButton = page.locator('#btn-details-cataract-phaco');
  await expect(detailsButton).toBeVisible();
  await detailsButton.click();
  await expect(page.getByRole('dialog')).toContainText(/Cataract/i);
  await page.keyboard.press('Escape');

  const bookButton = page.locator('#btn-book-spec-cataract-phaco');
  await expect(bookButton).toBeVisible();
  await bookButton.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('#modal-patient-name')).toBeVisible();

  const specialtyValue = await dialog
    .locator('#modal-specialty-select')
    .inputValue();
  expect(specialtyValue).toBe('cataract-phaco');
});
