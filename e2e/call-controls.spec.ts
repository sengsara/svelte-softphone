import { expect, test } from '@playwright/test';
import { connect, gotoApp, startActiveCall } from './support/app';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await connect(page);
  await startActiveCall(page);
});

test('microphone can be muted and unmuted', async ({ page }) => {
  await page.getByRole('button', { name: 'Mute Microphone' }).click();
  await expect(page.getByRole('button', { name: 'Unmute Microphone' })).toBeVisible();

  await page.getByRole('button', { name: 'Unmute Microphone' }).click();
  await expect(page.getByRole('button', { name: 'Mute Microphone' })).toBeVisible();
});

test('call can be put on hold and resumed', async ({ page }) => {
  await page.getByRole('button', { name: 'Hold Call' }).click();

  await expect(page.getByTestId('carousel-panel-0')).toContainText('On Hold');
  await expect(page.getByRole('button', { name: 'Resume Call' })).toBeVisible();

  await page.getByRole('button', { name: 'Resume Call' }).click();
  await expect(page.getByTestId('carousel-panel-0')).toContainText('Active Call');
  await expect(page.getByRole('button', { name: 'Hold Call' })).toBeVisible();
});

test('mute and hold controls are disabled when there is no active call', async ({ page }) => {
  await page.getByRole('button', { name: 'End Call' }).click();
  await expect(page.getByTestId('carousel-panel-0')).toContainText('Ready');

  await expect(page.getByRole('button', { name: 'Mute Microphone' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Hold Call' })).toBeDisabled();
});
