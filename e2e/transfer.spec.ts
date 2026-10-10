import { expect, test } from '@playwright/test';
import { bridge, connect, gotoApp, lastDTMF, startActiveCall } from './support/app';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await connect(page);
  await startActiveCall(page);
});

test('blind transfer sends the ## prefix and shows transfer state', async ({ page }) => {
  await bridge.transfer(page, '777');

  const panel = page.getByTestId('carousel-panel-0');
  await expect(panel).toContainText('In Transfer');
  await expect(panel).toContainText('Transfer To');
  await expect(panel).toContainText('777');
  expect(await lastDTMF(page)).toBe('##777');
});

test('attended transfer walkthrough sends the expected DTMF codes', async ({ page }) => {
  await bridge.attendedTransfer(page, 'transfer', '888');
  await expect(page.getByTestId('carousel-panel-0')).toContainText('Attended Transfer');
  await expect(page.getByTestId('carousel-panel-0')).toContainText('888');
  expect(await lastDTMF(page)).toBe('*2888');

  await bridge.attendedTransfer(page, 'merge', '');
  expect(await lastDTMF(page)).toBe('*5');
  await expect(page.getByTestId('carousel-panel-0')).toContainText('Active Call');

  await bridge.attendedTransfer(page, 'swap', '');
  expect(await lastDTMF(page)).toBe('*6');

  await bridge.attendedTransfer(page, 'finish', '');
  expect(await lastDTMF(page)).toBe('*4');
});

test('attended transfer can be cancelled', async ({ page }) => {
  await bridge.attendedTransfer(page, 'transfer', '888');
  await bridge.attendedTransfer(page, 'cancel', '');
  expect(await lastDTMF(page)).toBe('*3');
  await expect(page.getByTestId('carousel-panel-0')).toContainText('Active Call');
});
