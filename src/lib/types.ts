// Shared types for the Svelte SoftPhone.

/** SIP/JsSIP connection configuration. */
export interface SipConfig {
  domain?: string;
  port?: number;
  wsUrl?: string;
  ws_servers?: string;
  secret?: string;
  password?: string;
  uri?: string;
  display_name?: string;
  debug?: boolean;
  [key: string]: unknown;
}

/** A call as rendered by the UI (mirrors the JsSIP session fields we display). */
export interface DisplayCall {
  id: number | string;
  sessionId: string;
  info?: string;
  callNumber?: string;
  callInfo?: string;
  direction?: 'incoming' | 'outgoing' | string;
  inCall?: boolean;
  inAnswer?: boolean;
  inAnswerTransfer?: boolean;
  hold?: boolean;
  muted?: number;
  autoMute?: number;
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
  duration?: number;
  side?: string;
  [key: string]: unknown;
}

/** A ringing/queued inbound call (kept separately from `displayCalls`). */
export interface PhoneCall {
  callNumber: string;
  sessionId: string;
  direction?: string;
  ring?: boolean;
  duration?: number;
  [key: string]: unknown;
}

/** A single entry in the call history log. */
export interface CallRecord {
  status: 'missed' | 'answered';
  sessionId: string;
  direction?: string;
  number: string;
  /** Epoch milliseconds. */
  time: number;
}

/** An entry in the asterisk account list used for transfers. */
export interface AsteriskAccount {
  accountId: string;
  label?: string;
  online?: number | string;
  [key: string]: unknown;
}

/** The phone state object owned by the parent application. */
export interface LocalStatePhone {
  displayCalls: DisplayCall[];
  phoneCalls: PhoneCall[];
  callHistory: CallRecord[];
  connectedPhone: boolean;
  connectingPhone: boolean;
  darkMode: boolean;
  notifications: boolean;
  callVolume: number;
  ringVolume: number;
  connectOnStart: boolean;
  userPresence: string;
}
