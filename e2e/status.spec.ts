import { expect, test } from '@playwright/test';
import { connect, gotoApp } from './support/app';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
});

test('internet status follows online/offline browser events', async ({ page }) => {
  const chip = page.getByTestId('status-internet');
  await expect(chip).toContainText('Online');

  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(chip).toContainText('Offline');

  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(chip).toContainText('Online');
});

test('softphone status reflects the connection lifecycle', async ({ page }) => {
  const chip = page.getByTestId('status-softphone');
  await expect(chip).toContainText('Offline');

  await connect(page);

  await page.getByRole('checkbox', { name: 'Softphone connection' }).uncheck();
  await expect(chip).toContainText('Offline');
});
