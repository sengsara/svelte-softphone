import { UA, WebSocketInterface } from 'jssip';
import { debugLog, debugError } from './constants';
import type { SipConfig } from './types';

/**
 * Minimal structural type for a JsSIP RTCSession as used by this engine.
 * Only the members the UI actually touches are declared; the index signature
 * keeps the door open for other session fields.
 */
export interface Call {
  id: string;
  direction?: string;
  connection?: RTCPeerConnection;
  customPayload?: unknown;
  hold?: () => void;
  unhold?: () => void;
  terminate?: (options?: unknown) => void;
  mute?: () => void;
  unmute?: () => void;
  answer?: (options?: unknown) => void;
  sendDTMF?: (code: string) => void;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  [key: string]: unknown;
}

/** Structural view of the JsSIP UA methods this engine relies on. */
interface EnginePhone {
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  start: () => void;
  stop: () => void;
  call: (target: string, options?: Record<string, unknown>) => Call;
  isRegistered: () => boolean;
}

type UAConfig = ConstructorParameters<typeof UA>[0];

export type CallActionHandler = (action: string, ...args: unknown[]) => void;
export type EngineEventHandler = (event: string, data: unknown) => void;

/**
 * Imperative wrapper around a JsSIP User Agent.
 *
 * This is intentionally a plain class (not a Svelte component): the engine's
 * internal state is read imperatively by the application, while all reactive
 * UI state lives in the parent's `LocalStatePhone`.
 */
export class CallsFlowControl {
  config: SipConfig = {};
  phone: EnginePhone | null = null;
  activeCall: Call | null = null;
  callsQueue: Call[] = [];
  holdCallsQueue: Call[] = [];
  micMuted = false;
  connectedPhone = false;
  initiated = false;

  /** Called when the engine wants to notify the UI about a call action. */
  onCallActionConnection?: CallActionHandler;
  /** Called for raw UA engine events (connected, registered, ...). */
  onEngineEvent?: EngineEventHandler;

  private sessions = new Map<string, Call>();

  private handleNewRTCSession = (payload: unknown): void => {
    const session = (payload as { session?: Call }).session;
    if (!session) return;

    this.sessions.set(session.id, session);
    this.registerSessionEvents(session);

    if (session.direction === 'incoming') {
      this.callsQueue.push(session);
      this.onCallActionConnection?.('incomingCall', session);
    } else {
      this.activeCall = session;
      this.onCallActionConnection?.('outgoingCall', session);
    }
  };

  /** Initialize the SIP user agent. Safe to call multiple times. */
  init(): void {
    if (this.phone) return;
    if (!this.config.domain) {
      debugError('Config error: Missing domain');
      return;
    }

    try {
      const wsUrl =
        this.config.wsUrl || `ws://${this.config.domain}:${this.config.port ?? 5060}`;
      const socket = new WebSocketInterface(wsUrl);
      const uaConfig = {
        ...this.config,
        uri: this.config.uri || `sip:${this.config.secret ?? 'phone'}@${this.config.domain}`,
        password: this.config.secret,
        sockets: [socket],
      } as unknown as UAConfig;

      const ua = new UA(uaConfig);
      this.phone = ua as unknown as EnginePhone;
      this.phone.on('newRTCSession', this.handleNewRTCSession);

      const events = [
        'connected',
        'disconnected',
        'registered',
        'unregistered',
        'registrationFailed',
        'invite',
        'message',
        'connecting',
      ];
      events.forEach((event) => {
        this.phone?.on(event, (data: unknown) => this.onEngineEvent?.(event, data));
      });

      this.initiated = true;
      this.connectedPhone = this.phone.isRegistered();
      debugLog('JSSIP initialized successfully');
    } catch (e) {
      debugError('JSSIP initialization error:', e);
    }
  }

  /** Start the SIP stack. */
  start(): void {
    if (!this.initiated || !this.phone) {
      this.notify('Please initialize phone before connecting');
      debugLog('Please call .init() before connect');
      return;
    }
    this.phone.start();
  }

  /** Stop the SIP stack. */
  stop(): void {
    this.phone?.stop();
  }

  /** Place an outgoing call. */
  call(to: string): void {
    if (!this.phone) return;
    if (!this.connectedPhone) {
      this.notify('Please connect to VoIP server first');
      debugLog('User agent not registered yet');
      return;
    }
    if (this.activeCall) {
      this.notify('Active call already exists');
      debugLog('Already has active call');
      return;
    }

    this.phone.call(`sip:${to}@${this.config.domain}`, {
      mediaConstraints: { audio: true },
      sessionTimersExpires: 600,
    });
  }

  /** Answer an incoming call. */
  answer(sessionId: string): void {
    if (this.activeCall) {
      debugLog('Already has active call');
      return;
    }
    try {
      const call = this.callsQueue.find((c) => c.id === sessionId);
      if (call) {
        call.answer?.({ mediaConstraints: { audio: true } });
        this.activeCall = call;
      }
    } catch (err) {
      debugError('Error answering call:', err);
      this.notify('Error answering call');
    }
  }

  /** Hang up the call with the given session id. */
  hungup(sessionId: string): void {
    try {
      this.sessions.get(sessionId)?.terminate?.();
    } catch {
      debugLog('Call already terminated');
    }
  }

  /** Hold (`true`) or resume (`false`) a call. */
  hold(sessionId: string, hold = true): void {
    if (hold === false) {
      this.unhold(sessionId);
    } else if (this.activeCall?.id === sessionId) {
      this.activeCall.hold?.();
    }
  }

  /** Resume a held call. */
  unhold(sessionId: string): void {
    if (!this.activeCall) {
      this.holdCallsQueue.find((c) => c.id === sessionId)?.unhold?.();
    } else {
      debugLog('Please exit from all active calls to unhold');
      this.notify('Please exit from all active calls to unhold');
    }
  }

  /** Toggle the microphone mute for the active call. */
  setMicMuted(): void {
    if (!this.activeCall) return;
    if (this.micMuted) {
      this.activeCall.unmute?.();
      this.micMuted = false;
      this.onCallActionConnection?.('unmute', this.activeCall.id);
    } else {
      this.activeCall.mute?.();
      this.micMuted = true;
      this.onCallActionConnection?.('mute', this.activeCall.id);
    }
  }

  /** Send DTMF tones on the active call. */
  sendDTMF(code: string): void {
    this.activeCall?.sendDTMF?.(code);
  }

  /** Notify the UI with a human readable message. */
  notify(message: string): void {
    this.onCallActionConnection?.('notify', message);
  }

  /** Debug helper: log the current engine queues. */
  tmpEvent(): void {
    debugLog('activeCall', this.activeCall);
    debugLog('callsQueue', this.callsQueue);
    debugLog('holdCallsQueue', this.holdCallsQueue);
  }

  private registerSessionEvents(call: Call): void {
    const events = [
      'connecting',
      'sending',
      'progress',
      'accepted',
      'newDTMF',
      'newInfo',
      'hold',
      'unhold',
      'muted',
      'unmuted',
      'reinvite',
      'update',
      'refer',
      'replaces',
      'sdp',
      'icecandidate',
      'getusermediafailed',
      'ended',
      'failed',
      'confirmed',
    ];

    events.forEach((type) => {
      call.on?.(type, (data: unknown, cause: unknown) =>
        this.handleSessionEvent(type, data, cause, call)
      );
    });
  }

  private handleSessionEvent(type: string, _data: unknown, _cause: unknown, call: Call): void {
    switch (type) {
      case 'hold':
        this.onCallActionConnection?.('hold', call.id);
        this.holdCallsQueue.push(call);
        if (this.activeCall?.id === call.id) this.activeCall = null;
        break;
      case 'unhold':
        this.onCallActionConnection?.('unhold', call.id);
        this.activeCall =
          this.holdCallsQueue.find((c) => c.id === call.id) ?? this.activeCall;
        this.holdCallsQueue = this.holdCallsQueue.filter((c) => c.id !== call.id);
        break;
      case 'muted':
        this.onCallActionConnection?.('muted', call.id);
        break;
      case 'confirmed':
        if (!this.activeCall) {
          this.activeCall = this.callsQueue.find((c) => c.id === call.id) ?? null;
        }
        this.callsQueue = this.callsQueue.filter((c) => c.id !== call.id);
        this.onCallActionConnection?.('callAccepted', call.id, this.activeCall);
        break;
      case 'ended':
      case 'failed':
        this.onCallActionConnection?.('callEnded', call.id);
        this.callsQueue = this.callsQueue.filter((c) => c.id !== call.id);
        if (this.activeCall?.id === call.id) this.activeCall = null;
        this.holdCallsQueue = this.holdCallsQueue.filter((c) => c.id !== call.id);
        this.sessions.delete(call.id);
        break;
      default:
        break;
    }
  }
}
