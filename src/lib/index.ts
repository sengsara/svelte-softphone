// Public API for @sengsara/svelte-softphone.

// Components
export { default as SoftPhone } from './SoftPhone.svelte';
export { default as KeypadBlock } from './KeypadBlock.svelte';
export { default as CallQueue } from './CallQueue.svelte';
export { default as StatusBlock } from './StatusBlock.svelte';
export { default as SettingsBlock } from './SettingsBlock.svelte';
export { default as SwipeCarouselBlock } from './SwipeCarouselBlock.svelte';

// JsSIP engine
export { CallsFlowControl } from './CallsFlowControl';
export type { Call, CallActionHandler, EngineEventHandler } from './CallsFlowControl';

// Types
export type { SipConfig, DisplayCall, LocalStatePhone } from './types';

// Utilities and constants
export {
  AUDIO_PATHS,
  NOTIFICATION_DEFAULTS,
  CALL_STATES,
  CONNECTION_STATES,
  isBrowser,
  isReactNative,
  hasNotificationAPI,
  debugLog,
  debugError,
  debugWarn
} from './constants';
