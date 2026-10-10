/**
 * Mock JsSIP implementation used for e2e tests.
 *
 * `vite.config.ts` aliases the `jssip` module to this file when Vite runs in
 * "e2e" mode. It mirrors only the surface that `src/lib/CallsFlowControl.ts`
 * uses and exposes a control API on `window.__jssip` so tests can drive call
 * scenarios (incoming calls, progress, hold, mute, DTMF, ...).
 */

export type MockCallDirection = 'incoming' | 'outgoing';

export interface MockCallInit {
  id?: string;
  direction?: MockCallDirection;
  /** Remote user, surfaced as the call number in the UI. */
  user?: string;
  displayName?: string;
}

type Listener = (...args: unknown[]) => void;

let callCounter = 0;
const nextCallId = (): string => `call-${++callCounter}`;

export class MockRTCSession {
  id: string;
  direction: MockCallDirection;
  connection: RTCPeerConnection | undefined = undefined;
  remote_identity: { uri: { user: string; host: string }; display_name: string };
  customPayload: unknown = undefined;

  answered = false;
  terminated = false;
  held = false;
  isMuted = false;
  readonly dtmf: string[] = [];

  private listeners = new Map<string, Listener[]>();

  constructor(init: MockCallInit = {}) {
    this.id = init.id ?? nextCallId();
    this.direction = init.direction ?? 'outgoing';
    const user = init.user ?? '1000';
    this.remote_identity = {
      uri: { user, host: 'mock.local' },
      display_name: init.displayName ?? user
    };
  }

  on(event: string, callback: Listener): this {
    const list = this.listeners.get(event) ?? [];
    list.push(callback);
    this.listeners.set(event, list);
    return this;
  }

  private emit(event: string, ...args: unknown[]): void {
    (this.listeners.get(event) ?? []).forEach((cb) => cb(...args));
  }

  answer(): void {
    this.answered = true;
    this.emit('confirmed');
  }

  terminate(): void {
    this.terminated = true;
    this.emit('ended');
  }

  hold(): void {
    this.held = true;
    this.emit('hold');
  }

  unhold(): void {
    this.held = false;
    this.emit('unhold');
  }

  mute(): void {
    this.isMuted = true;
    this.emit('muted');
  }

  unmute(): void {
    this.isMuted = false;
    this.emit('unmuted');
  }

  sendDTMF(tone: string): void {
    this.dtmf.push(tone);
    this.emit('newDTMF', { tone });
  }

  /** Test helper: emit a SIP progress response (e.g. 180 Ringing). */
  progress(status: number): void {
    this.emit('progress', { originator: 'remote', response: { status_code: status } });
  }
}

export class MockUA {
  config: unknown;
  registered = false;
  connected = false;
  started = false;
  readonly calls: MockRTCSession[] = [];

  private listeners = new Map<string, Listener[]>();

  constructor(config: unknown) {
    this.config = config;
    controls.ua = this;
  }

  on(event: string, callback: Listener): this {
    const list = this.listeners.get(event) ?? [];
    list.push(callback);
    this.listeners.set(event, list);
    return this;
  }

  private emit(event: string, ...args: unknown[]): void {
    (this.listeners.get(event) ?? []).forEach((cb) => cb(...args));
  }

  start(): void {
    this.started = true;
    queueMicrotask(() => {
      this.connected = true;
      this.emit('connected', {});
      this.registered = true;
      this.emit('registered', {});
    });
  }

  stop(): void {
    this.started = false;
    this.connected = false;
    this.registered = false;
    this.emit('unregistered', {});
    this.emit('disconnected', {});
  }

  isRegistered(): boolean {
    return this.registered;
  }

  call(target: string): MockRTCSession {
    const user = target.replace(/^sip:/, '').split('@')[0];
    const call = new MockRTCSession({ direction: 'outgoing', user });
    this.calls.push(call);
    this.emit('newRTCSession', { session: call });
    return call;
  }

  /** Test helper: simulate an incoming call. */
  incoming(init: MockCallInit = {}): MockRTCSession {
    const call = new MockRTCSession({ ...init, direction: 'incoming' });
    this.calls.push(call);
    this.emit('newRTCSession', { session: call });
    return call;
  }
}

/** Mirrors `jssip`'s WebSocketInterface constructor signature. */
export class WebSocketInterface {
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}

// `CallsFlowControl.ts` imports the class as `UA`.
export { MockUA as UA };

export interface JsSipControls {
  ua: MockUA | null;
  calls(): MockRTCSession[];
  incoming(init?: MockCallInit): string;
  progress(id: string, status: number): void;
  answer(id: string): void;
  terminate(id: string): void;
  hold(id: string): void;
  unhold(id: string): void;
  mute(id: string): void;
  unmute(id: string): void;
  lastDTMF(): string | undefined;
  reset(): void;
}

function findCall(id: string): MockRTCSession | undefined {
  return controls.ua?.calls.find((c) => c.id === id);
}

const controls: JsSipControls = {
  ua: null,
  calls: () => controls.ua?.calls ?? [],
  incoming(init = {}) {
    return controls.ua?.incoming(init).id ?? '';
  },
  progress(id, status) {
    findCall(id)?.progress(status);
  },
  answer(id) {
    findCall(id)?.answer();
  },
  terminate(id) {
    findCall(id)?.terminate();
  },
  hold(id) {
    findCall(id)?.hold();
  },
  unhold(id) {
    findCall(id)?.unhold();
  },
  mute(id) {
    findCall(id)?.mute();
  },
  unmute(id) {
    findCall(id)?.unmute();
  },
  lastDTMF() {
    const all = controls.ua?.calls.flatMap((c) => c.dtmf) ?? [];
    return all.at(-1);
  },
  reset() {
    controls.ua = null;
    callCounter = 0;
  }
};

declare global {
  interface Window {
    __jssip?: JsSipControls;
  }
}

if (typeof window !== 'undefined') {
  window.__jssip = controls;
}
