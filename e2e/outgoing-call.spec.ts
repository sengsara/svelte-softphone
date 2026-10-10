import { expect, test } from '@playwright/test';
import { answerRemote, connect, dial, gotoApp, lastCallId, makeCall } from './support/app';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await connect(page);
});

test('dial pad places an outgoing call shown as ringing then active', async ({ page }) => {
  await dial(page, '123');
  await makeCall(page);

  const panel = page.getByTestId('carousel-panel-0');
  await expect(panel).toContainText('Ringing');
  await expect(panel).toContainText('123');
  await expect(panel).toContainText('Outgoing');

  const id = await lastCallId(page);
  await answerRemote(page, id);
  await expect(panel).toContainText('Active Call');
});

test('outgoing call can be ended from the keypad', async ({ page }) => {
  await dial(page, '100');
  await makeCall(page);

  await expect(page.getByRole('button', { name: 'End Call' })).toBeVisible();
  await page.getByRole('button', { name: 'End Call' }).click();

  await expect(page.getByTestId('carousel-panel-0')).toContainText('Ready');
  await expect(page.getByRole('button', { name: 'Make Call' })).toBeVisible();
});

test('dial state is cleared after the call is placed', async ({ page }) => {
  await dial(page, '42');
  await makeCall(page);
  const id = await lastCallId(page);
  await answerRemote(page, id);
  await page.getByRole('button', { name: 'End Call' }).click();

  // Placing a new call without dialing should not call anyone.
  await makeCall(page);
  await expect(page.getByTestId('carousel-panel-0')).toContainText('Ready');
});
