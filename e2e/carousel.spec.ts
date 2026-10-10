import { expect, test } from '@playwright/test';
import { connect, gotoApp, startActiveCall } from './support/app';

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
});

test('clicking a channel tab selects it', async ({ page }) => {
  const tab2 = page.getByRole('tab', { name: 'Ch 2' });
  await tab2.click();
  await expect(tab2).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: 'Ch 1' })).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByTestId('carousel-panel-1')).toBeVisible();
});

test('each channel shows its own call state', async ({ page }) => {
  await connect(page);
  await startActiveCall(page);

  await expect(page.getByTestId('carousel-panel-0')).toContainText('Active Call');
  await expect(page.getByTestId('carousel-panel-1')).toContainText('Ready');
  await expect(page.getByTestId('carousel-panel-2')).toContainText('Ready');
});

test('panels expose accessible tab semantics', async ({ page }) => {
  const panel = page.getByRole('tabpanel').first();
  await expect(panel).toHaveAttribute('aria-labelledby', 'full-width-tab-0');
});
