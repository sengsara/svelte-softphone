import { expect, test } from '@playwright/test';
import { gotoApp } from './support/app';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
});

test('renders the softphone panel with the full dial pad', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Softphone' })).toBeVisible();

  for (const key of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']) {
    await expect(page.getByRole('button', { name: key, exact: true })).toBeVisible();
  }

  await expect(page.getByRole('button', { name: 'Make Call' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mute Microphone' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hold Call' })).toBeVisible();
});

test('renders the three channel tabs', async ({ page }) => {
  await expect(page.getByRole('tab', { name: 'Ch 1' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Ch 2' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Ch 3' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Ch 1' })).toHaveAttribute('aria-selected', 'true');
});

test('shows an empty call queue and no active call by default', async ({ page }) => {
  await expect(page.getByText('No incoming calls')).toBeVisible();
  await expect(page.getByTestId('carousel-panel-0')).toContainText('No active call');
});

test('close button hides the panel', async ({ page }) => {
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Softphone' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Make Call' })).toBeHidden();
});
