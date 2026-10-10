<script lang="ts">
  import { CallsFlowControl } from './lib/CallsFlowControl';
  import type { SipConfig, LocalStatePhone, DisplayCall } from './lib/types';
  import SoftPhone from './SoftPhone.svelte';

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

  // Set the active channel
  function setActiveChannel(channel: number): void {
    activeChannel = channel;
  }

  // Connect to server
  function connectToServer(): void {
    if (config.domain && config.secret) {
      flowRoute.config = { ...config };
      flowRoute.init();
      flowRoute.start();
    }
  }

  // Handle call
  function handleCall(event?: unknown): void {
    const target = (event as { target?: HTMLInputElement } | undefined)?.target;
    const number = target?.value ?? (typeof event === 'string' ? event : '');
    if (number) {
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
    if (!number) return;

    localStatePhone.displayCalls = localStatePhone.displayCalls.map((a: DisplayCall) =>
      a.id === activeChannel
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
          a.id === activeChannel
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
    localStatePhone.connectedPhone = Boolean(connected);
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
