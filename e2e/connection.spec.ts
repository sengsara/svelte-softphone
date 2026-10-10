import { expect, test } from '@playwright/test';
import { connect, gotoApp } from './support/app';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
});

test('starts disconnected, connects, and disconnects again', async ({ page }) => {
  await expect(page.getByTestId('status-softphone')).toContainText('Offline');

  await connect(page);

  const checkbox = page.getByRole('checkbox', { name: 'Softphone connection' });
  await expect(checkbox).toBeChecked();

  await checkbox.uncheck();
  await expect(page.getByTestId('status-softphone')).toContainText('Offline');
  await expect(checkbox).not.toBeChecked();
});

test('connecting toggles the connection label in the settings panel', async ({ page }) => {
  await expect(page.getByText('Disconnected', { exact: true })).toBeVisible();
  await connect(page);
  await expect(page.getByText('Connected', { exact: true })).toBeVisible();
});
