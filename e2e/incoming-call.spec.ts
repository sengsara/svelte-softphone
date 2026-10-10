import { expect, test } from '@playwright/test';
import { connect, gotoApp, simulateIncoming } from './support/app';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await connect(page);
});

test('incoming call shows parsed caller metadata and can be answered', async ({ page }) => {
  await simulateIncoming(page, { user: '5551234-Jakarta-ACME' });

  const item = page.getByTestId('call-queue-item');
  await expect(item).toHaveCount(1);
  await expect(item).toContainText('Caller:');
  await expect(item).toContainText('5551234');
  await expect(item).toContainText('Jurisdiction:');
  await expect(item).toContainText('Jakarta');
  await expect(item).toContainText('Company Number:');
  await expect(item).toContainText('ACME');

  await item.getByRole('button', { name: 'Answer Call' }).click();

  await expect(page.getByTestId('call-queue-item')).toHaveCount(0);
  await expect(page.getByTestId('carousel-panel-0')).toContainText('Active Call');
  await expect(page.getByTestId('carousel-panel-0')).toContainText('5551234-Jakarta-ACME');
});

test('incoming call can be rejected', async ({ page }) => {
  await simulateIncoming(page, { user: '999' });

  const item = page.getByTestId('call-queue-item');
  await expect(item).toHaveCount(1);
  await item.getByRole('button', { name: 'Reject Call' }).click();

  await expect(page.getByTestId('call-queue-item')).toHaveCount(0);
  await expect(page.getByTestId('carousel-panel-0')).toContainText('Ready');
});

test('multiple incoming calls render as separate queue items', async ({ page }) => {
  await simulateIncoming(page, { user: '111-Alpha' });
  await simulateIncoming(page, { user: '222-Beta' });

  await expect(page.getByTestId('call-queue-item')).toHaveCount(2);
  await expect(page.getByTestId('call-queue-item').first()).toContainText('111');
  await expect(page.getByTestId('call-queue-item').nth(1)).toContainText('222');
});
