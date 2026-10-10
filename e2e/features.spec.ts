import { expect, test } from '@playwright/test';
import {
  connect,
  gotoApp,
  lastDTMF,
  startActiveCall
} from './support/app';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await connect(page);
});

test('dial input places a call on Enter', async ({ page }) => {
  const dial = page.getByLabel('Phone Number');
  await dial.fill('555');
  await dial.press('Enter');

  const panel = page.getByTestId('carousel-panel-0');
  await expect(panel).toContainText('Ringing');
  await expect(panel).toContainText('555');
});

test('blind transfer button sends the ## prefix', async ({ page }) => {
  await startActiveCall(page);

  await page.getByLabel('Phone Number').fill('777');
  await page.getByRole('button', { name: 'Transfer Call' }).click();

  await expect(page.getByTestId('carousel-panel-0')).toContainText('In Transfer');
  expect(await lastDTMF(page)).toBe('##777');
});

test('blind transfer with an empty dial opens the account picker', async ({ page }) => {
  await startActiveCall(page);

  await page.getByRole('button', { name: 'Transfer Call' }).click();
  await expect(page.getByTestId('search-list')).toBeVisible();

  await page.getByRole('option', { name: /1001/ }).click();
  expect(await lastDTMF(page)).toBe('##1001');
});

test('attended transfer button sends *2 and reveals the control row', async ({ page }) => {
  await startActiveCall(page);

  await page.getByLabel('Phone Number').fill('888');
  await page.getByRole('button', { name: 'Attended Transfer' }).click();

  await expect(page.getByTestId('carousel-panel-0')).toContainText('Attended Transfer');
  expect(await lastDTMF(page)).toBe('*2888');

  await expect(page.getByRole('button', { name: 'Conference' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Swap Caller' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pass Call' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel Transfer' })).toBeVisible();

  await page.getByRole('button', { name: 'Conference' }).click();
  expect(await lastDTMF(page)).toBe('*5');
});

test('completed calls appear in the history tab', async ({ page }) => {
  await startActiveCall(page);

  await page.getByRole('button', { name: 'End Call' }).click();
  await expect(page.getByTestId('carousel-panel-0')).toContainText('Ready');

  await page.getByTestId('tab-history').click();
  await expect(page.getByTestId('call-history')).toBeVisible();
  await expect(page.getByTestId('history-item')).toHaveCount(1);
});
