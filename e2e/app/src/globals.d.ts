/// <reference types="vite/client" />
import type { LocalStatePhone } from '@sengsara/svelte-softphone';

/**
 * Test-only bridge exposed on `window.__softphone` by the e2e harness app. It
 * lets Playwright drive flows that have no dedicated UI control (e.g. call
 * transfer) and inspect the current phone state.
 */
export interface SoftPhoneTestBridge {
  transfer(transferedNumber?: string): void;
  attendedTransfer(event: string, number?: string): void;
  state: LocalStatePhone;
}

declare global {
  interface Window {
    __softphone?: SoftPhoneTestBridge;
  }
}
