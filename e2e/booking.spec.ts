import { expect, test } from '@playwright/test';

test('patient can submit a booking request and receive a ticket', async ({
  page,
}) => {
  await page.goto('/?lang=en');

  await page.locator('#btn-nav-book-appointment').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.locator('#modal-patient-name').fill('E2E Booking Probe');
  await dialog.locator('#modal-patient-phone').fill('0910000001');
  await dialog
    .locator('#modal-patient-email')
    .fill('e2e-booking-probe@example.com');

  const specialtySelect = dialog.locator('#modal-specialty-select');
  if (await specialtySelect.isVisible()) {
    await specialtySelect.selectOption({ index: 1 });
  }

  await dialog.locator('#btn-modal-confirm-booking').click();

  await expect(dialog).toContainText(/BK-\d+/, { timeout: 10_000 });
});
