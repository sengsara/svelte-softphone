import { expect, test } from '@playwright/test';
import { gotoApp } from './support/app';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
});

test('auto-connect preference can be toggled', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Auto-Connect' });
  await expect(checkbox).not.toBeChecked();
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
});

test('notifications preference can be toggled', async ({ page }) => {
  const checkbox = page.getByRole('checkbox', { name: 'Notifications' });
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
});

test('call audio volume slider updates the percentage', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Call Audio Volume' });

  await slider.fill('1');
  await expect(page.getByText('100%', { exact: true })).toBeVisible();

  await slider.fill('0');
  await expect(page.getByText('0%', { exact: true })).toBeVisible();
});

test('ringtone volume slider updates the percentage', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Ringtone Volume' });

  await slider.fill('0.5');
  await expect(page.getByText('50%', { exact: true })).toBeVisible();

  await slider.fill('0.25');
  await expect(page.getByText('25%', { exact: true })).toBeVisible();
});
