<script lang="ts">
  import {
    SoftPhone,
    CallsFlowControl,
    type Call,
    type SipConfig,
    type LocalStatePhone,
    type DisplayCall
  } from '@sengsara/svelte-softphone';
  import type { SoftPhoneTestBridge } from './globals';

  // JSSIP configuration
  const config = $state<SipConfig>({
    domain: 'localhost',
    port: 5060,
    wsUrl: 'ws://localhost:5060',
    secret: 'your-secret-here',
    debug: false
  });

  // Create flow route instance
  const flowRoute = new CallsFlowControl();

  // Local state phone (will be managed by parent or external store)
  const localStatePhone = $state<LocalStatePhone>({
    displayCalls: [],
    connectedPhone: false,
    darkMode: false,
    notifications: true,
    callVolume: 0.8,
    ringVolume: 0.8,
    connectOnStart: false
  });

  // Active channel
  let activeChannel = $state(0);

  // Dial state
  let dialState = $state('');

  // Derive the displayed remote number from a JsSIP session
  function remoteNumber(call: Call): string {
    const identity = call.remote_identity as
      | { uri?: { user?: string }; display_name?: string }
      | undefined;
    return identity?.uri?.user ?? identity?.display_name ?? 'Unknown';
  }

  // Insert or update a call in the display list
  function upsertCall(partial: Partial<DisplayCall> & { sessionId: string }): void {
    const exists = localStatePhone.displayCalls.some((c) => c.sessionId === partial.sessionId);
    if (exists) {
      localStatePhone.displayCalls = localStatePhone.displayCalls.map((c) =>
        c.sessionId === partial.sessionId ? { ...c, ...partial } : c
      );
    } else {
      localStatePhone.displayCalls = [
        ...localStatePhone.displayCalls,
        { id: partial.sessionId, ...partial } as DisplayCall
      ];
    }
  }

  // Remove a call from the display list
  function removeCall(sessionId: string): void {
    localStatePhone.displayCalls = localStatePhone.displayCalls.filter(
      (c) => c.sessionId !== sessionId
    );
  }

  // Wire engine call actions into UI state
  flowRoute.onCallActionConnection = (action, ...args) => {
    const sessionId = typeof args[0] === 'string' ? args[0] : '';
    switch (action) {
      case 'incomingCall': {
        const call = args[0] as Call;
        upsertCall({
          sessionId: call.id,
          callNumber: remoteNumber(call),
          callInfo: 'Incoming Call',
          info: `from ${remoteNumber(call)}`,
          direction: 'incoming',
          inCall: false,
          inAnswer: false,
          hold: false,
          muted: 0
        });
        break;
      }
      case 'outgoingCall': {
        const call = args[0] as Call;
        upsertCall({
          sessionId: call.id,
          callNumber: remoteNumber(call),
          callInfo: 'Calling...',
          info: '',
          direction: 'outgoing',
          inCall: true,
          inAnswer: false,
          hold: false,
          muted: 0
        });
        break;
      }
      case 'callAccepted':
        upsertCall({
          sessionId,
          inCall: true,
          inAnswer: true,
          hold: false,
          callInfo: 'Active Call'
        });
        break;
      case 'hold':
        upsertCall({ sessionId, hold: true, callInfo: 'On Hold' });
        break;
      case 'unhold':
        upsertCall({ sessionId, hold: false, callInfo: 'Active Call' });
        break;
      case 'mute':
      case 'muted':
        upsertCall({ sessionId, muted: 1, callInfo: 'Muted' });
        break;
      case 'unmute':
      case 'unmuted':
        upsertCall({ sessionId, muted: 0, callInfo: 'Active Call' });
        break;
      case 'callEnded':
        removeCall(sessionId);
        break;
      default:
        break;
    }
  };

  // Wire engine connection events into UI state
  flowRoute.onEngineEvent = (event) => {
    if (event === 'connected' || event === 'registered') {
      localStatePhone.connectedPhone = true;
    } else if (
      event === 'disconnected' ||
      event === 'unregistered' ||
      event === 'registrationFailed'
    ) {
      localStatePhone.connectedPhone = false;
    }
  };

  // Set the active channel
  function setActiveChannel(channel: number): void {
    activeChannel = channel;
  }

  // Handle call
  function handleCall(event?: unknown): void {
    const target = (event as { target?: HTMLInputElement } | undefined)?.target;
    const fromEvent = target?.value ?? (typeof event === 'string' ? event : '');
    const number = fromEvent || dialState;
    if (number) {
      dialState = '';
      flowRoute.call(number);
    }
  }

  // Handle end call
  function handleEndCall(sessionId?: unknown): void {
    if (typeof sessionId === 'string') flowRoute.hungup(sessionId);
  }

  // Handle hold
  function handleHold(sessionId?: unknown, hold?: unknown): void {
    if (typeof sessionId === 'string') flowRoute.hold(sessionId, hold !== false);
  }

  // Handle mic mute
  function handleMicMute(): void {
    flowRoute.setMicMuted();
  }

  // Handle answer
  function handleAnswer(sessionId?: unknown): void {
    if (typeof sessionId === 'string') flowRoute.answer(sessionId);
  }

  // Handle reject
  function handleReject(sessionId?: unknown): void {
    if (typeof sessionId === 'string') flowRoute.hungup(sessionId);
  }

  // Handle call transfer
  function handleCallTransfer(transferedNumber?: unknown): void {
    const number = dialState || (typeof transferedNumber === 'string' ? transferedNumber : '');
    const activeId = localStatePhone.displayCalls[activeChannel]?.sessionId;
    if (!number || !activeId) return;

    localStatePhone.displayCalls = localStatePhone.displayCalls.map((a: DisplayCall) =>
      a.sessionId === activeId
        ? {
            ...a,
            transferNumber: number,
            inTransfer: true,
            allowAttendedTransfer: false,
            allowFinishTransfer: false,
            allowTransfer: false,
            callInfo: 'Transferring...'
          }
        : a
    );

    flowRoute.activeCall?.sendDTMF?.(`##${number}`);
  }

  // Handle attended transfer
  function handleCallAttendedTransfer(event: string, number?: unknown): void {
    const target = dialState || (typeof number === 'string' ? number : '');
    const calls = localStatePhone.displayCalls;
    const activeId = calls[activeChannel]?.sessionId;

    switch (event) {
      case 'transfer':
        localStatePhone.displayCalls = calls.map((a: DisplayCall) =>
          a.sessionId === activeId
            ? {
                ...a,
                transferNumber: target,
                allowAttendedTransfer: false,
                allowTransfer: false,
                transferControl: true,
                allowFinishTransfer: false,
                callInfo: 'Attended Transfer',
                inTransfer: true
              }
            : a
        );
        flowRoute.activeCall?.sendDTMF?.(`*2${target}`);
        break;
      case 'merge':
        localStatePhone.displayCalls = calls.map((a: DisplayCall) =>
          a.sessionId === activeId
            ? { ...a, inTransfer: false, attendedTransferOnline: '' }
            : a
        );
        flowRoute.activeCall?.sendDTMF?.('*5');
        break;
      case 'swap':
        flowRoute.activeCall?.sendDTMF?.('*6');
        break;
      case 'finish':
        flowRoute.activeCall?.sendDTMF?.('*4');
        break;
      case 'cancel':
        localStatePhone.displayCalls = calls.map((a: DisplayCall) =>
          a.sessionId === activeId
            ? {
                ...a,
                inTransfer: false,
                attendedTransferOnline: '',
                transferControl: false,
                allowTransfer: true,
                allowAttendedTransfer: true
              }
            : a
        );
        flowRoute.activeCall?.sendDTMF?.('*3');
        break;
      default:
        break;
    }
  }

  // Handle settings button
  function handleSettingsButton(): void {
    flowRoute.tmpEvent();
  }

  // Handle dark mode
  function handleDarkMode(checked?: unknown): void {
    localStatePhone.darkMode = Boolean(checked);
  }

  // Handle user presence
  function handleUserPresence(_status?: unknown): void {
    // Placeholder for user presence
  }

  // Handle press key (dial pad)
  function handlePressKey(key?: unknown): void {
    if (typeof key === 'string' && dialState.length < 15) {
      dialState += key;
    }
  }

  // Handle launcher toggle
  function handleLauncherToggle(): void {
    // Toggle softphone visibility
  }

  // Handle settings open
  function handleSettingsOpen(): void {
    // Open settings
  }

  // Handle connect phone
  function handleConnectPhone(connected?: unknown): void {
    const on = Boolean(connected);
    localStatePhone.connectedPhone = on;
    if (on) {
      flowRoute.config = { ...config };
      flowRoute.init();
      flowRoute.start();
    } else {
      flowRoute.stop();
      localStatePhone.connectedPhone = false;
    }
  }

  // Handle connect on start
  function handleConnectOnStart(checked?: unknown): void {
    localStatePhone.connectOnStart = Boolean(checked);
  }

  // Handle notifications
  function handleNotifications(checked?: unknown): void {
    localStatePhone.notifications = Boolean(checked);
  }

  // Handle settings slider (volume)
  function handleSettingsSlider(type?: unknown, value?: unknown): void {
    const volume = typeof value === 'number' ? value : Number(value);
    if (type === 'callVolume') {
      localStatePhone.callVolume = volume;
    } else if (type === 'ringVolume') {
      localStatePhone.ringVolume = volume;
    }
  }

  // Handle user presence status
  function handleUserPresenceStatus(_status?: unknown): void {
    // Update presence status
  }

  // Test-only bridge (available only when Vite runs in "e2e" mode)
  if (import.meta.env.MODE === 'e2e') {
    const bridge: SoftPhoneTestBridge = {
      transfer: (n?: string) => handleCallTransfer(n),
      attendedTransfer: (event: string, n?: string) => handleCallAttendedTransfer(event, n),
      state: localStatePhone
    };
    window.__softphone = bridge;
  }
</script>

<SoftPhone
  {flowRoute}
  {localStatePhone}
  {activeChannel}
  {setActiveChannel}
  {handleCall}
  {handleEndCall}
  {handleHold}
  {handleMicMute}
  {handleAnswer}
  {handleReject}
  {handleCallTransfer}
  {handleCallAttendedTransfer}
  {handleSettingsButton}
  {handleDarkMode}
  {handleUserPresence}
  {handlePressKey}
  {handleLauncherToggle}
  {handleSettingsOpen}
  {handleConnectPhone}
  {handleConnectOnStart}
  {handleNotifications}
  {handleSettingsSlider}
  {handleUserPresenceStatus}
/>
