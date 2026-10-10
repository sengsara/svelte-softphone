import { expect, type Page } from '@playwright/test';

/** Label used by the status chip when the softphone is connected. */
export const ONLINE = 'Online';

/** Open the app and wait for the softphone panel to render. */
export async function gotoApp(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Softphone' })).toBeVisible();
}

/** Connect to the (mocked) SIP server and wait until the UI reports Online. */
export async function connect(page: Page): Promise<void> {
  await page.getByRole('checkbox', { name: 'Softphone connection' }).check();
  await expect(page.getByTestId('status-softphone')).toContainText(ONLINE);
}

/** Simulate an incoming call through the JsSIP mock. */
export async function simulateIncoming(
  page: Page,
  init: { user: string; displayName?: string }
): Promise<void> {
  await page.evaluate((value) => {
    const api = window.__jssip;
    if (!api) throw new Error('JsSIP mock not installed');
    api.incoming(value);
  }, init);
}

/** Id of the most recently created (mocked) call. */
export async function lastCallId(page: Page): Promise<string> {
  return page.evaluate(() => {
    const api = window.__jssip;
    if (!api) throw new Error('JsSIP mock not installed');
    const calls = api.calls();
    return calls.length > 0 ? calls[calls.length - 1].id : '';
  });
}

/** Answer the most recent call from the "remote" end. */
export async function answerRemote(page: Page, id: string): Promise<void> {
  await page.evaluate((callId) => {
    const api = window.__jssip;
    if (!api) throw new Error('JsSIP mock not installed');
    api.answer(callId);
  }, id);
}

/** Terminate a call from the "remote" end. */
export async function terminateRemote(page: Page, id: string): Promise<void> {
  await page.evaluate((callId) => {
    const api = window.__jssip;
    if (!api) throw new Error('JsSIP mock not installed');
    api.terminate(callId);
  }, id);
}

/** The most recent DTMF tone sent by the app. */
export async function lastDTMF(page: Page): Promise<string | undefined> {
  return page.evaluate(() => {
    const api = window.__jssip;
    return api ? api.lastDTMF() : undefined;
  });
}

/** Press the given digits on the dial pad. */
export async function dial(page: Page, digits: string): Promise<void> {
  for (const digit of digits) {
    await page.getByRole('button', { name: digit, exact: true }).click();
  }
}

/** Press the green call button. */
export async function makeCall(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Make Call' }).click();
}

/**
 * Dial, place an outgoing call and answer it from the remote end, leaving an
 * active call on channel 0. Returns the call id.
 */
export async function startActiveCall(page: Page, digits = '100'): Promise<string> {
  await dial(page, digits);
  await makeCall(page);
  const id = await lastCallId(page);
  await answerRemote(page, id);
  await expect(page.getByTestId('carousel-panel-0')).toContainText('Active Call');
  return id;
}

/** Trigger flows that have no dedicated UI control (via the e2e bridge). */
export const bridge = {
  transfer(page: Page, number: string): Promise<void> {
    return page.evaluate((n) => {
      window.__softphone?.transfer(n);
    }, number);
  },
  attendedTransfer(page: Page, event: string, number: string): Promise<void> {
    return page.evaluate(
      (args: [string, string]) => {
        window.__softphone?.attendedTransfer(args[0], args[1]);
      },
      [event, number] as [string, string]
    );
  },
  displayCallCount(page: Page): Promise<number> {
    return page.evaluate(() => window.__softphone?.state.displayCalls.length ?? -1);
  }
};
