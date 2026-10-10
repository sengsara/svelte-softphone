// Shared types for the Svelte SoftPhone.

declare global {
  interface Window {
    __SOFTPHONE_DEBUG__?: boolean;
    __softphone?: SoftPhoneTestBridge;
  }
}

/** SIP/JsSIP connection configuration. */
export interface SipConfig {
  domain?: string;
  port?: number;
  wsUrl?: string;
  secret?: string;
  debug?: boolean;
  uri?: string;
  [key: string]: unknown;
}

/** A call as rendered by the UI (mirrors the JsSIP session fields we display). */
export interface DisplayCall {
  id: number | string;
  sessionId: string;
  callNumber?: string;
  callInfo?: string;
  info?: string;
  direction?: 'incoming' | 'outgoing' | string;
  inCall?: boolean;
  inAnswer?: boolean;
  hold?: boolean;
  muted?: number;
  inTransfer?: boolean;
  transferNumber?: string;
  attendedTransferOnline?: string;
  inConference?: boolean;
  allowAttendedTransfer?: boolean;
  allowFinishTransfer?: boolean;
  allowTransfer?: boolean;
  transferControl?: boolean;
  callDuration?: number;
  ringDuration?: number;
  [key: string]: unknown;
}

/** The phone state object owned by the parent application. */
export interface LocalStatePhone {
  displayCalls: DisplayCall[];
  connectedPhone: boolean;
  darkMode: boolean;
  notifications: boolean;
  callVolume: number;
  ringVolume: number;
  connectOnStart: boolean;
}

/**
 * Test-only bridge exposed on `window.__softphone` when Vite runs in "e2e"
 * mode. It lets e2e tests trigger flows that have no dedicated UI control yet
 * (e.g. call transfer) and inspect the current phone state.
 */
export interface SoftPhoneTestBridge {
  transfer(transferedNumber?: string): void;
  attendedTransfer(event: string, number?: string): void;
  state: LocalStatePhone;
}
