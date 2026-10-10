<script lang="ts">
  import { onMount } from 'svelte';
  import {
    SoftPhone,
    CallsFlowControl,
    NOTIFICATION_DEFAULTS,
    hasNotificationAPI,
    type Call,
    type SipConfig,
    type LocalStatePhone,
    type DisplayCall,
    type PhoneCall,
    type CallRecord,
    type AsteriskAccount
  } from '@sengsara/svelte-softphone';

  // JSSIP configuration
  const config: SipConfig = {
    domain: 'localhost',
    port: 5060,
    ws_servers: 'ws://localhost:5060',
    secret: 'your-secret-here',
    display_name: '1000',
    debug: false
  };

  const flowRoute = new CallsFlowControl();

  function createChannels(): DisplayCall[] {
    return [1, 2, 3].map((n, index) => ({
      id: index,
      info: `Ch ${n}`,
      hold: false,
      muted: 0,
      autoMute: 0,
      inCall: false,
      inAnswer: false,
      inTransfer: false,
      inAnswerTransfer: false,
      inConference: false,
      callInfo: 'Ready',
      allowTransfer: true,
      transferControl: false,
      allowAttendedTransfer: true,
      transferNumber: '',
      attendedTransferOnline: '',
      callNumber: '',
      duration: 0,
      side: '',
      sessionId: ''
    }));
  }

  function stored(key: string, fallback: string): string {
    if (typeof localStorage === 'undefined') return fallback;
    return localStorage.getItem(key) ?? fallback;
  }

  const localStatePhone = $state<LocalStatePhone>({
    displayCalls: createChannels(),
    phoneCalls: [],
    callHistory: [],
    connectedPhone: false,
    connectingPhone: false,
    darkMode: false,
    notifications: stored('softphone-notifications', 'true') === 'true',
    callVolume: parseFloat(stored('softphone-call-volume', '0.8')),
    ringVolume: parseFloat(stored('softphone-ring-volume', '0.6')),
    connectOnStart: stored('softphone-connect-on-start', 'false') === 'true',
    userPresence: 'available'
  });

  let activeChannel = $state(0);
  let dialState = $state('');
  let panelOpen = $state(true);
  let notifyMessage = $state('');
  let timelocale = $state('UTC');

  let asteriskAccounts: AsteriskAccount[] = [
    { accountId: '1001', label: 'Front Desk', online: 1 },
    { accountId: '1002', label: 'Support', online: 1 },
    { accountId: '1003', label: 'Manager', online: 0 }
  ];

  let player: HTMLAudioElement | undefined;
  let ringer: HTMLAudioElement | undefined;
  let ringbackTone: HTMLAudioElement | undefined;

  function remoteIdentity(call: Call): { callNumber: string; direction: string } {
    const identity = call.remote_identity as
      | { display_name?: string; uri?: { user?: string } }
      | undefined;
    const callNumber = identity?.display_name
      ? identity.display_name
      : (identity?.uri?.user ?? 'Unknown');
    return { callNumber, direction: call.direction ?? 'incoming' };
  }

  function notify(message: string): void {
    if (message) notifyMessage = message;
  }

  function requestNotificationPermission(): void {
    if (hasNotificationAPI()) {
      window.Notification.requestPermission();
    }
  }

  function showNotification(caller: string): void {
    if (!localStatePhone.notifications || !hasNotificationAPI()) return;
    if (window.Notification.permission !== 'granted') return;
    try {
      const notification = new window.Notification(NOTIFICATION_DEFAULTS.TITLE, {
        icon: NOTIFICATION_DEFAULTS.ICON,
        body: `Caller: ${caller}`
      });
      notification.addEventListener('click', () => {
        window.focus();
        notification.close();
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  function addHistory(record: CallRecord): void {
    localStatePhone.callHistory = [record, ...localStatePhone.callHistory];
  }

  // Engine -> UI wiring
  flowRoute.onEngineEvent = (event) => {
    switch (event) {
      case 'connecting':
        localStatePhone.connectingPhone = true;
        break;
      case 'connected':
        localStatePhone.connectingPhone = false;
        localStatePhone.connectedPhone = true;
        break;
      case 'disconnected':
        localStatePhone.connectingPhone = false;
        localStatePhone.connectedPhone = false;
        break;
      default:
        break;
    }
  };

  flowRoute.onCallActionConnection = (action, ...args) => {
    const sessionId = typeof args[0] === 'string' ? args[0] : '';
    switch (action) {
      case 'incomingCall': {
        const call = args[0] as Call;
        const { callNumber, direction } = remoteIdentity(call);
        const entry: PhoneCall = {
          callNumber,
          sessionId: call.id,
          direction,
          ring: false,
          duration: 0
        };
        localStatePhone.phoneCalls = [...localStatePhone.phoneCalls, entry];
        showNotification(callNumber);
        break;
      }
      case 'outgoingCall': {
        const call = args[0] as Call;
        const { callNumber, direction } = remoteIdentity(call);
        localStatePhone.displayCalls[activeChannel] = {
          ...localStatePhone.displayCalls[activeChannel],
          inCall: true,
          hold: false,
          inAnswer: false,
          direction,
          sessionId: call.id,
          callNumber: callNumber || dialState,
          callInfo: 'Ringing'
        };
        dialState = '';
        break;
      }
      case 'callAccepted': {
        const accepted = args[1] as (Call & { customPayload?: unknown }) | null;
        const fromQueue = localStatePhone.phoneCalls.find((c) => c.sessionId === sessionId);
        localStatePhone.phoneCalls = localStatePhone.phoneCalls.filter(
          (c) => c.sessionId !== sessionId
        );
        const channelId =
          typeof accepted?.customPayload === 'number' ? accepted.customPayload : activeChannel;
        localStatePhone.displayCalls = localStatePhone.displayCalls.map((a, index) =>
          index === channelId
            ? {
                ...a,
                callNumber: fromQueue?.callNumber ?? a.callNumber,
                sessionId,
                duration: 0,
                direction: fromQueue?.direction ?? a.direction,
                inCall: true,
                inAnswer: true,
                hold: false,
                callInfo: 'Answered'
              }
            : a
        );
        break;
      }
      case 'callEnded': {
        const fromQueue = localStatePhone.phoneCalls.find((c) => c.sessionId === sessionId);
        const inDisplay = localStatePhone.displayCalls.find((c) => c.sessionId === sessionId);
        localStatePhone.phoneCalls = localStatePhone.phoneCalls.filter(
          (c) => c.sessionId !== sessionId
        );
        localStatePhone.displayCalls = localStatePhone.displayCalls.map((a) =>
          a.sessionId === sessionId
            ? {
                ...a,
                inCall: false,
                inAnswer: false,
                hold: false,
                muted: 0,
                inTransfer: false,
                inAnswerTransfer: false,
                allowFinishTransfer: false,
                allowTransfer: true,
                allowAttendedTransfer: true,
                inConference: false,
                callInfo: 'Ready',
                sessionId: ''
              }
            : a
        );
        if (fromQueue) {
          addHistory({
            status: 'missed',
            sessionId: fromQueue.sessionId,
            direction: fromQueue.direction,
            number: fromQueue.callNumber,
            time: Date.now()
          });
        } else if (inDisplay) {
          addHistory({
            status: inDisplay.inAnswer ? 'answered' : 'missed',
            sessionId: inDisplay.sessionId,
            direction: inDisplay.direction,
            number: inDisplay.callNumber ?? '',
            time: Date.now()
          });
        }
        break;
      }
      case 'reinvite': {
        const data = args[1] as { request?: { headers?: Record<string, unknown> } } | undefined;
        let online = '';
        const pai = data?.request?.headers?.['P-Asserted-Identity'];
        if (Array.isArray(pai) && pai[0] && typeof pai[0] === 'object' && 'raw' in pai[0]) {
          online = String((pai[0] as { raw?: string }).raw).split(' ')[0];
        }
        localStatePhone.displayCalls = localStatePhone.displayCalls.map((a) =>
          a.sessionId === sessionId
            ? {
                ...a,
                allowAttendedTransfer: true,
                allowTransfer: true,
                inAnswerTransfer: true,
                inTransfer: true,
                attendedTransferOnline: online
              }
            : a
        );
        break;
      }
      case 'hold':
        localStatePhone.displayCalls = localStatePhone.displayCalls.map((a) =>
          a.sessionId === sessionId ? { ...a, hold: true, callInfo: 'On Hold' } : a
        );
        break;
      case 'unhold':
        localStatePhone.displayCalls = localStatePhone.displayCalls.map((a) =>
          a.sessionId === sessionId ? { ...a, hold: false, callInfo: 'Answered' } : a
        );
        break;
      case 'mute':
      case 'muted':
        localStatePhone.displayCalls = localStatePhone.displayCalls.map((a) =>
          a.sessionId === sessionId ? { ...a, muted: 1 } : a
        );
        break;
      case 'unmute':
      case 'unmuted':
        localStatePhone.displayCalls = localStatePhone.displayCalls.map((a) =>
          a.sessionId === sessionId ? { ...a, muted: 0 } : a
        );
        break;
      case 'notify':
        notify(String(args[0] ?? ''));
        break;
      default:
        break;
    }
  };

  function setActiveChannel(channel: number): void {
    activeChannel = channel;
  }

  function handleCall(): void {
    if (/^[0-9]+$/.test(dialState)) {
      flowRoute.call(dialState);
    }
  }

  function handleEndCall(sessionId?: unknown): void {
    if (typeof sessionId === 'string') flowRoute.hungup(sessionId);
  }

  function handleHold(sessionId?: unknown, hold?: unknown): void {
    if (typeof sessionId === 'string') flowRoute.hold(sessionId, hold !== false);
  }

  function handleMicMute(): void {
    flowRoute.setMicMuted();
  }

  function handleAnswer(sessionId?: unknown): void {
    if (typeof sessionId === 'string') flowRoute.answer(sessionId);
  }

  function handleReject(sessionId?: unknown): void {
    if (typeof sessionId === 'string') flowRoute.hungup(sessionId);
  }

  function handleCallTransfer(transferedNumber?: unknown): void {
    const number = dialState || (typeof transferedNumber === 'string' ? transferedNumber : '');
    const activeId = localStatePhone.displayCalls[activeChannel]?.sessionId;
    if (!number || !activeId) return;
    localStatePhone.displayCalls = localStatePhone.displayCalls.map((a) =>
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

  function handleCallAttendedTransfer(event: string, number?: unknown): void {
    const target = dialState || (typeof number === 'string' ? number : '');
    const activeId = localStatePhone.displayCalls[activeChannel]?.sessionId;
    switch (event) {
      case 'transfer':
        localStatePhone.displayCalls = localStatePhone.displayCalls.map((a) =>
          a.sessionId === activeId
            ? {
                ...a,
                transferNumber: target,
                allowAttendedTransfer: false,
                allowTransfer: false,
                transferControl: true,
                allowFinishTransfer: false,
                callInfo: 'Attended Transfer',
                inTransfer: true,
                inAnswerTransfer: true
              }
            : a
        );
        flowRoute.activeCall?.sendDTMF?.(`*2${target}`);
        break;
      case 'merge':
        localStatePhone.displayCalls = localStatePhone.displayCalls.map((a) =>
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
        localStatePhone.displayCalls = localStatePhone.displayCalls.map((a) =>
          a.sessionId === activeId
            ? {
                ...a,
                inTransfer: false,
                inAnswerTransfer: false,
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

  function handleSettingsButton(): void {
    flowRoute.tmpEvent();
  }

  function handleDarkMode(checked?: unknown): void {
    localStatePhone.darkMode = Boolean(checked);
  }

  function handleUserPresence(status?: unknown): void {
    localStatePhone.userPresence = String(status ?? 'available');
  }

  function handlePressKey(key?: unknown): void {
    if (typeof key === 'string' && dialState.length < 15) {
      dialState += key;
    }
  }

  function setDialState(value: string): void {
    dialState = value;
  }

  function setSoftPhoneOpen(value: boolean): void {
    panelOpen = value;
  }

  function handleConnectPhone(connected?: unknown): void {
    const on = Boolean(connected);
    localStatePhone.connectingPhone = true;
    if (on) {
      flowRoute.config = { ...config };
      flowRoute.init();
      flowRoute.start();
    } else {
      flowRoute.stop();
    }
  }

  function handleConnectOnStart(checked?: unknown): void {
    const value = Boolean(checked);
    localStatePhone.connectOnStart = value;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('softphone-connect-on-start', String(value));
    }
  }

  function handleNotifications(checked?: unknown): void {
    const value = Boolean(checked);
    localStatePhone.notifications = value;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('softphone-notifications', String(value));
    }
    if (value) requestNotificationPermission();
  }

  function handleSettingsSlider(type?: unknown, value?: unknown): void {
    const volume = Math.max(0, Math.min(1, typeof value === 'number' ? value : Number(value) || 0));
    if (type === 'callVolume') {
      localStatePhone.callVolume = volume;
      if (player) player.volume = volume;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('softphone-call-volume', String(volume));
      }
    } else if (type === 'ringVolume') {
      localStatePhone.ringVolume = volume;
      if (ringer) ringer.volume = volume;
      if (ringbackTone) ringbackTone.volume = volume;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('softphone-ring-volume', String(volume));
      }
    }
  }

  // Apply dark mode to <html>
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', localStatePhone.darkMode);
    }
  });

  onMount(() => {
    flowRoute.config = { ...config };
    flowRoute.init();

    if (ringer) {
      ringer.src = '/sound/ringing.ogg';
      ringer.loop = true;
      ringer.volume = localStatePhone.ringVolume;
    }
    if (player) {
      player.volume = localStatePhone.callVolume;
    }
    ringbackTone = new Audio('/sound/ringback.ogg');
    ringbackTone.loop = true;
    ringbackTone.volume = localStatePhone.ringVolume;

    flowRoute.player = player ?? null;
    flowRoute.ringer = ringer ?? null;
    flowRoute.ringbackTone = ringbackTone;

    if (localStatePhone.connectOnStart) {
      handleConnectPhone(true);
    }

    timelocale = Intl.DateTimeFormat().resolvedOptions().timeZone;
  });
</script>

<main class="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
  <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
    Svelte WebRTC Phone — example
  </h1>
  <p class="mt-2 text-gray-600 dark:text-gray-300">
    The softphone panel is docked to the right side of the screen.
  </p>
</main>

<SoftPhone
  {flowRoute}
  {localStatePhone}
  {activeChannel}
  {setActiveChannel}
  accounts={asteriskAccounts}
  {timelocale}
  {dialState}
  {setDialState}
  {notifyMessage}
  onNotifyClose={() => (notifyMessage = '')}
  softPhoneOpen={panelOpen}
  {setSoftPhoneOpen}
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
  {handleConnectPhone}
  {handleConnectOnStart}
  {handleNotifications}
  {handleSettingsSlider}
/>

<div hidden>
  <audio bind:this={player} preload="auto"></audio>
</div>
<div hidden>
  <audio bind:this={ringer} preload="auto"></audio>
</div>
